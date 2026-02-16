import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8787);
const ALLOWED_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_CONFIG_FILE =
  process.env.BACKEND_CONFIG_FILE || path.join(__dirname, 'runtime-config.json');
const runtimeConfig = {
  rmApiBaseUrl:
    process.env.RM_API_BASE_URL || 'http://dbs.brazilsouth.cloudapp.azure.com:8051',
  rmAuthUsersPath: process.env.RM_AUTH_USERS_PATH || '/api/framework/v1/users',
  rmConsultaBasePath:
    process.env.RM_CONSULTA_BASE_PATH || '/api/framework/v1/consultaSQLServer/RealizaConsulta',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
};

const loadPersistedRuntimeConfig = async () => {
  try {
    const content = await readFile(BACKEND_CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== 'object') return;
    Object.assign(runtimeConfig, parsed);
  } catch (_error) {
    // Primeiro boot ou arquivo ausente/corrompido: mantém config padrão.
  }
};

const persistRuntimeConfig = async () => {
  const dir = path.dirname(BACKEND_CONFIG_FILE);
  await mkdir(dir, { recursive: true });
  await writeFile(BACKEND_CONFIG_FILE, JSON.stringify(runtimeConfig, null, 2), 'utf8');
};

const sessions = new Map();
const upload = multer({ storage: multer.memoryStorage() });

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
  })
);
app.use(express.json({ limit: '10mb' }));

const getRmUrl = (path) => `${runtimeConfig.rmApiBaseUrl.replace(/\/$/, '')}${path}`;

const getBearerToken = (req) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.slice('Bearer '.length).trim();
};

const requireAuth = (req, res, next) => {
  const token = getBearerToken(req);
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
  }
  req.session = sessions.get(token);
  req.sessionToken = token;
  return next();
};

const buildConsultaPath = ({
  codSentenca,
  codColigada,
  codSistema,
  parameters,
  context,
  useUppercaseParameters = true,
  encodeQuery = false,
  basePath = runtimeConfig.rmConsultaBasePath,
}) => {
  if (!codSentenca || codColigada === null || codColigada === undefined || !codSistema) {
    return '';
  }

  const queryParts = [];
  const encode = encodeQuery ? encodeURIComponent : (value) => value;
  const paramKey = useUppercaseParameters ? 'PARAMETERS' : 'parameters';
  const contextKey = useUppercaseParameters ? 'CONTEXT' : 'context';

  if (parameters) {
    queryParts.push(`${paramKey}=${encode(parameters)}`);
  }

  if (context) {
    queryParts.push(`${contextKey}=${encode(context)}`);
  }

  const queryString = queryParts.join('&');
  return `${basePath}/${codSentenca}/${codColigada}/${codSistema}/${queryString ? `?${queryString}` : ''}`;
};

const parseGoogleAmount = (price) => {
  if (!price) return null;
  const units = Number(price.units || 0);
  const nanos = Number(price.nanos || 0) / 1_000_000_000;
  return units + nanos;
};

const getTollEstimateFromRoute = (route) => {
  const prices = route?.travelAdvisory?.tollInfo?.estimatedPrice || [];
  if (!Array.isArray(prices) || prices.length === 0) {
    return { amount: null, currency: null };
  }

  const totalsByCurrency = prices.reduce((acc, price) => {
    const currency = price?.currencyCode || 'BRL';
    const value = parseGoogleAmount(price);
    if (value === null || Number.isNaN(value)) return acc;
    acc[currency] = (acc[currency] || 0) + value;
    return acc;
  }, {});

  if (totalsByCurrency.BRL !== undefined) {
    return { amount: Number(totalsByCurrency.BRL.toFixed(2)), currency: 'BRL' };
  }

  const firstCurrency = Object.keys(totalsByCurrency)[0];
  if (!firstCurrency) {
    return { amount: null, currency: null };
  }
  return {
    amount: Number(totalsByCurrency[firstCurrency].toFixed(2)),
    currency: firstCurrency,
  };
};

const computeGoogleRoute = async ({ origin, destination, includeTolls = false }) => {
  const fieldMaskBase = ['routes.distanceMeters'];
  if (includeTolls) {
    fieldMaskBase.push('routes.travelAdvisory.tollInfo');
  }

  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': runtimeConfig.googleMapsApiKey,
      'X-Goog-FieldMask': fieldMaskBase.join(','),
    },
    body: JSON.stringify({
      origin: { address: origin },
      destination: { address: destination },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      computeAlternativeRoutes: false,
      languageCode: 'pt-BR',
      units: 'METRIC',
      ...(includeTolls ? { extraComputations: ['TOLLS'] } : {}),
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.error?.message || 'Falha ao consultar Google Routes API.';
    throw new Error(message);
  }

  const route = data?.routes?.[0];
  const distanceMeters = route?.distanceMeters;
  if (distanceMeters === undefined || distanceMeters === null) {
    throw new Error('Rota não encontrada.');
  }

  const tollEstimate = includeTolls ? getTollEstimateFromRoute(route) : { amount: null, currency: null };
  return {
    distanceMeters: Number(distanceMeters),
    tollAmount: tollEstimate.amount,
    tollCurrency: tollEstimate.currency,
  };
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'central-rm-backend' });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    const rmResponse = await fetch(getRmUrl(`${runtimeConfig.rmAuthUsersPath}/${username}`), {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    });

    const rmData = await rmResponse.json().catch(() => null);
    if (!rmResponse.ok) {
      return res.status(rmResponse.status).json({
        message: rmData?.message || 'Falha na autenticação com RM.',
      });
    }

    const sessionToken = randomUUID();
    sessions.set(sessionToken, {
      username,
      password,
      userData: rmData,
      createdAt: Date.now(),
    });

    return res.json({
      token: sessionToken,
      user: rmData,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno no login.',
      details: error?.message || String(error),
    });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(req.session.userData);
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  sessions.delete(req.sessionToken);
  res.json({ success: true });
});

app.post('/api/rm/consulta-sql', requireAuth, async (req, res) => {
  try {
    const {
      codSentenca,
      codColigada,
      codSistema,
      parameters,
      context,
      useUppercaseParameters = true,
      encodeQuery = false,
      basePath = runtimeConfig.rmConsultaBasePath,
    } = req.body || {};

    const path = buildConsultaPath({
      codSentenca,
      codColigada,
      codSistema,
      parameters,
      context,
      useUppercaseParameters,
      encodeQuery,
      basePath,
    });

    if (!path) {
      return res.status(400).json({ message: 'Parâmetros inválidos para Consulta SQL.' });
    }

    const credentials = Buffer.from(`${req.session.username}:${req.session.password}`).toString(
      'base64'
    );
    const rmResponse = await fetch(getRmUrl(path), {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    });

    const rmData = await rmResponse.json().catch(() => null);
    if (!rmResponse.ok) {
      return res.status(rmResponse.status).json({
        message: rmData?.message || 'Erro ao executar Consulta SQL no RM.',
      });
    }

    return res.json(rmData);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno ao executar Consulta SQL.',
      details: error?.message || String(error),
    });
  }
});

app.post('/api/maps/distance', requireAuth, async (req, res) => {
  try {
    const {
      origin,
      destination,
      roundTrip = false,
      includeTolls = false,
    } = req.body || {};
    if (!origin || !destination) {
      return res.status(400).json({
        message: 'Informe origem e destino.',
      });
    }

    if (!runtimeConfig.googleMapsApiKey) {
      return res.status(500).json({
        message: 'GOOGLE_MAPS_API_KEY não configurada no backend.',
      });
    }

    const outbound = await computeGoogleRoute({
      origin,
      destination,
      includeTolls,
    });

    let totalDistanceMeters = outbound.distanceMeters;
    let tollAmount = outbound.tollAmount;
    let tollCurrency = outbound.tollCurrency;

    if (roundTrip) {
      const inbound = await computeGoogleRoute({
        origin: destination,
        destination: origin,
        includeTolls,
      });
      totalDistanceMeters += inbound.distanceMeters;

      if (includeTolls) {
        if (tollCurrency && inbound.tollCurrency && tollCurrency !== inbound.tollCurrency) {
          tollAmount = null;
          tollCurrency = null;
        } else {
          tollCurrency = tollCurrency || inbound.tollCurrency || null;
          const outboundValue = Number(outbound.tollAmount || 0);
          const inboundValue = Number(inbound.tollAmount || 0);
          const sum = outboundValue + inboundValue;
          tollAmount = sum > 0 ? Number(sum.toFixed(2)) : null;
        }
      }
    } else if (includeTolls) {
      tollAmount = outbound.tollAmount;
      tollCurrency = outbound.tollCurrency;
    }

    const km = Number((totalDistanceMeters / 1000).toFixed(1));
    return res.json({
      origin,
      destination,
      distanceMeters: totalDistanceMeters,
      distanceKm: km,
      tollAmount,
      tollCurrency,
      roundTripApplied: Boolean(roundTrip),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno ao calcular distância.',
      details: error?.message || String(error),
    });
  }
});

app.post('/api/maps/autocomplete', requireAuth, async (req, res) => {
  try {
    const { input } = req.body || {};
    if (!input || String(input).trim().length < 3) {
      return res.json({ suggestions: [] });
    }

    if (!runtimeConfig.googleMapsApiKey) {
      return res.status(500).json({
        message: 'GOOGLE_MAPS_API_KEY não configurada no backend.',
      });
    }

    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': runtimeConfig.googleMapsApiKey,
        'X-Goog-FieldMask':
          'suggestions.placePrediction.text.text,suggestions.placePrediction.placeId',
      },
      body: JSON.stringify({
        input: String(input).trim(),
        languageCode: 'pt-BR',
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const message = data?.error?.message || 'Falha ao consultar Places API.';
      return res.status(response.status).json({ message });
    }

    const suggestions = (data?.suggestions || [])
      .map((item) => {
        const prediction = item?.placePrediction;
        return {
          text: prediction?.text?.text || '',
          placeId: prediction?.placeId || '',
        };
      })
      .filter((item) => item.text);

    return res.json({ suggestions });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno ao consultar autocomplete.',
      details: error?.message || String(error),
    });
  }
});

app.post('/api/uploads', requireAuth, upload.array('files'), (req, res) => {
  const files = req.files || [];
  const payload = files.map((file) => ({
    id: randomUUID(),
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }));

  res.status(201).json({
    message: 'Upload concluído.',
    files: payload,
  });
});

app.get('/api/admin/runtime-config', requireAuth, (_req, res) => {
  res.json({
    rmApiBaseUrl: runtimeConfig.rmApiBaseUrl,
    rmAuthUsersPath: runtimeConfig.rmAuthUsersPath,
    rmConsultaBasePath: runtimeConfig.rmConsultaBasePath,
    googleMapsApiKey: runtimeConfig.googleMapsApiKey,
  });
});

app.post('/api/admin/runtime-config', requireAuth, (req, res) => {
  const {
    rmApiBaseUrl,
    rmAuthUsersPath,
    rmConsultaBasePath,
    googleMapsApiKey,
  } = req.body || {};

  if (rmApiBaseUrl) runtimeConfig.rmApiBaseUrl = String(rmApiBaseUrl).trim();
  if (rmAuthUsersPath) runtimeConfig.rmAuthUsersPath = String(rmAuthUsersPath).trim();
  if (rmConsultaBasePath) runtimeConfig.rmConsultaBasePath = String(rmConsultaBasePath).trim();
  if (googleMapsApiKey !== undefined) runtimeConfig.googleMapsApiKey = String(googleMapsApiKey).trim();

  persistRuntimeConfig()
    .then(() => {
      res.json({
        message: 'Configurações atualizadas e persistidas no backend.',
        runtimeConfig: {
          rmApiBaseUrl: runtimeConfig.rmApiBaseUrl,
          rmAuthUsersPath: runtimeConfig.rmAuthUsersPath,
          rmConsultaBasePath: runtimeConfig.rmConsultaBasePath,
          googleMapsApiKey: runtimeConfig.googleMapsApiKey,
        },
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Configuração aplicada, mas falhou ao persistir em disco.',
        details: error?.message || String(error),
      });
    });
});

loadPersistedRuntimeConfig()
  .then(() => persistRuntimeConfig())
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
      console.log(`Runtime config file: ${BACKEND_CONFIG_FILE}`);
    });
  });
