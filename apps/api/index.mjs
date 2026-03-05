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
const BACKEND_SECRETS_FILE =
  process.env.BACKEND_SECRETS_FILE || path.join(__dirname, 'runtime-secrets.json');
const TRAVEL_REQUESTS_FILE =
  process.env.TRAVEL_REQUESTS_FILE || path.join(__dirname, 'travel-requests.json');
const TRAVEL_REQUESTS_MAX = Math.max(
  100,
  Number(process.env.TRAVEL_REQUESTS_MAX || 10000)
);
const DATABASE_URL = process.env.DATABASE_URL || '';
const DATABASE_SSL = String(process.env.DATABASE_SSL || 'false').toLowerCase() === 'true';
const runtimeConfig = {
  rmApiBaseUrl:
    process.env.RM_API_BASE_URL || 'http://dbs.brazilsouth.cloudapp.azure.com:8051',
  rmAuthUsersPath: process.env.RM_AUTH_USERS_PATH || '/api/framework/v1/users',
  rmConsultaBasePath:
    process.env.RM_CONSULTA_BASE_PATH || '/api/framework/v1/consultaSQLServer/RealizaConsulta',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
};
const INTEGRATION_STATUS = Object.freeze({
  PENDENTE: 'PENDENTE',
  ENVIADO: 'ENVIADO',
  ERRO: 'ERRO',
  INTEGRADO: 'INTEGRADO',
});
const VALID_INTEGRATION_STATUS = new Set(Object.values(INTEGRATION_STATUS));
const VALID_LOCAL_USER_ROLES = new Set(['Administrador', 'Financeiro', 'Gestor']);
const travelRequests = [];
const appUsers = [];
const googleApiKeys = [];
let dbPool = null;
let dbStorageEnabled = false;

const getDbPool = async () => {
  if (!DATABASE_URL) return null;
  if (dbPool) return dbPool;
  try {
    const { Pool } = await import('pg');
    dbPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_SSL ? { rejectUnauthorized: false } : false,
    });
    dbStorageEnabled = true;
    return dbPool;
  } catch (_error) {
    dbStorageEnabled = false;
    console.warn(
      'DATABASE_URL configurada, mas pacote "pg" não está instalado. Usando fallback em arquivo local.'
    );
    return null;
  }
};

const normalizeText = (value, maxLength = 0) => {
  const text = String(value || '').trim();
  if (!maxLength) return text;
  return text.slice(0, maxLength);
};

const normalizeNullableText = (value, maxLength = 0) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  if (!maxLength) return text;
  return text.slice(0, maxLength);
};

const parseFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parsePositiveInt = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
};
const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return fallback;
};

const sanitizeArray = (value) => (Array.isArray(value) ? value : []);

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));

const generateTravelRequestId = () => {
  const tail = String(Date.now()).slice(-8);
  const randomSegment = String(Math.floor(100 + Math.random() * 900));
  return `DV-${tail}-${randomSegment}`;
};

const extractUserProfile = (username, rmData) => {
  const normalizedUsername = normalizeText(username, 80);
  const formattedName =
    normalizeText(rmData?.name?.formatted || rmData?.name || rmData?.fullName, 160) ||
    normalizedUsername;
  const email =
    normalizeNullableText(
      rmData?.emails?.[0]?.value || rmData?.email || rmData?.mail,
      200
    ) || null;
  const rmUserId = normalizeNullableText(rmData?.id || rmData?.code || rmData?.login, 120);
  const isActive =
    rmData?.active === undefined || rmData?.active === null ? true : Boolean(rmData?.active);

  return {
    username: normalizedUsername,
    displayName: formattedName,
    email,
    role: 'Financeiro',
    rmUserId,
    isActive,
  };
};
const maskApiKeyPreview = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';
  if (text.length <= 8) return '••••••••';
  return `${text.slice(0, 6)}••••••••••${text.slice(-2)}`;
};

const assignRuntimeConfig = (target, source = {}) => {
  if (!source || typeof source !== 'object') return target;
  if (source.rmApiBaseUrl !== undefined) target.rmApiBaseUrl = String(source.rmApiBaseUrl).trim();
  if (source.rmAuthUsersPath !== undefined) {
    target.rmAuthUsersPath = String(source.rmAuthUsersPath).trim();
  }
  if (source.rmConsultaBasePath !== undefined) {
    target.rmConsultaBasePath = String(source.rmConsultaBasePath).trim();
  }
  if (source.googleMapsApiKey !== undefined) {
    target.googleMapsApiKey = String(source.googleMapsApiKey).trim();
  }
  return target;
};

const initDatabase = async () => {
  const pool = await getDbPool();
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS travel_requests (
      request_id TEXT PRIMARY KEY,
      idempotency_key TEXT UNIQUE NOT NULL,
      requester TEXT NOT NULL,
      tipo_solicitacao TEXT NOT NULL,
      origem TEXT NOT NULL,
      destino TEXT NOT NULL,
      periodo_inicio DATE NOT NULL,
      periodo_fim DATE NOT NULL,
      km_estimado NUMERIC(12,2) NOT NULL DEFAULT 0,
      centro_custo TEXT NULL,
      total_value NUMERIC(14,2) NOT NULL,
      numero_rm TEXT NULL,
      integration_status TEXT NOT NULL,
      retry_count INTEGER NOT NULL DEFAULT 0,
      last_error TEXT NULL,
      itens JSONB NOT NULL DEFAULT '[]'::jsonb,
      rateio JSONB NOT NULL DEFAULT '[]'::jsonb,
      anexos JSONB NOT NULL DEFAULT '[]'::jsonb,
      observacao TEXT NOT NULL DEFAULT '',
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      integrated_at TIMESTAMPTZ NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      username TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      email TEXT NULL,
      role TEXT NOT NULL DEFAULT 'Financeiro',
      rm_user_id TEXT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      last_login_at TIMESTAMPTZ NULL,
      raw_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users (email)`
  );
  await pool.query(
    `ALTER TABLE app_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'Financeiro'`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_app_users_rm_user_id ON app_users (rm_user_id)`
  );
  await pool.query(`
    CREATE TABLE IF NOT EXISTS google_api_keys (
      id BIGSERIAL PRIMARY KEY,
      key_name TEXT NOT NULL UNIQUE,
      api_key TEXT NOT NULL,
      project_id TEXT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      last_rotated_at TIMESTAMPTZ NULL,
      notes TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_google_api_keys_active ON google_api_keys (is_active)`
  );
};

const upsertLocalUser = async ({ username, rmData }) => {
  const pool = await getDbPool();
  const profile = extractUserProfile(username, rmData);
  const nowIso = new Date().toISOString();

  if (!pool) {
    const existingIndex = appUsers.findIndex((entry) => entry.username === profile.username);
    const nextRecord = {
      username: profile.username,
      display_name: profile.displayName,
      email: profile.email,
      role: profile.role,
      rm_user_id: profile.rmUserId,
      is_active: profile.isActive,
      last_login_at: nowIso,
      raw_profile: rmData && typeof rmData === 'object' ? rmData : {},
      created_at: existingIndex >= 0 ? appUsers[existingIndex].created_at : nowIso,
      updated_at: nowIso,
    };
    if (existingIndex >= 0) {
      appUsers[existingIndex] = nextRecord;
    } else {
      appUsers.unshift(nextRecord);
    }
    return;
  }

  await pool.query(
    `
      INSERT INTO app_users (
        username, display_name, email, role, rm_user_id, is_active,
        last_login_at, raw_profile, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7::timestamptz, $8::jsonb, $9::timestamptz, $10::timestamptz
      )
      ON CONFLICT (username) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        rm_user_id = EXCLUDED.rm_user_id,
        is_active = EXCLUDED.is_active,
        last_login_at = EXCLUDED.last_login_at,
        raw_profile = EXCLUDED.raw_profile,
        updated_at = EXCLUDED.updated_at
    `,
    [
      profile.username,
      profile.displayName,
      profile.email,
      profile.role,
      profile.rmUserId,
      profile.isActive,
      nowIso,
      JSON.stringify(rmData && typeof rmData === 'object' ? rmData : {}),
      nowIso,
      nowIso,
    ]
  );
};

const listLocalUsers = async () => {
  const pool = await getDbPool();
  if (!pool) {
    return [...appUsers]
      .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
      .map((row) => ({
        username: row.username,
        displayName: row.display_name,
        email: row.email,
        role: row.role || 'Financeiro',
        rmUserId: row.rm_user_id,
        isActive: Boolean(row.is_active),
        lastLoginAt: row.last_login_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
  }

  const { rows } = await pool.query(`
    SELECT
      username, display_name, email, role, rm_user_id, is_active,
      last_login_at, created_at, updated_at
    FROM app_users
    ORDER BY updated_at DESC
  `);

  return rows.map((row) => ({
    username: row.username,
    displayName: row.display_name,
    email: row.email,
    role: row.role || 'Financeiro',
    rmUserId: row.rm_user_id,
    isActive: Boolean(row.is_active),
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  }));
};

const createLocalUser = async (payload = {}) => {
  const username = normalizeText(payload.username, 80).toLowerCase();
  const displayName = normalizeText(payload.displayName, 160);
  const email = normalizeNullableText(payload.email, 200);
  const requestedRole = normalizeText(payload.role, 40);
  const role = VALID_LOCAL_USER_ROLES.has(requestedRole) ? requestedRole : 'Financeiro';
  const rmUserId = normalizeNullableText(payload.rmUserId, 120);
  const isActive = parseBoolean(payload.isActive, true);
  if (!username || !displayName || !email) {
    return { error: 'Campos obrigatórios: username, displayName e email.' };
  }
  const nowIso = new Date().toISOString();
  const pool = await getDbPool();

  if (!pool) {
    const exists = appUsers.some((entry) => entry.username === username);
    if (exists) return { error: 'Usuário já existe localmente.' };
    appUsers.unshift({
      username,
      display_name: displayName,
      email,
      role,
      rm_user_id: rmUserId,
      is_active: isActive,
      last_login_at: null,
      raw_profile: {},
      created_at: nowIso,
      updated_at: nowIso,
    });
    return { data: await listLocalUsers() };
  }

  const existing = await pool.query('SELECT username FROM app_users WHERE username = $1 LIMIT 1', [
    username,
  ]);
  if (existing.rowCount > 0) {
    return { error: 'Usuário já existe localmente.' };
  }

  await pool.query(
    `
      INSERT INTO app_users (
        username, display_name, email, role, rm_user_id, is_active,
        last_login_at, raw_profile, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NULL, '{}'::jsonb, $7::timestamptz, $8::timestamptz)
    `,
    [username, displayName, email, role, rmUserId, isActive, nowIso, nowIso]
  );
  return { data: await listLocalUsers() };
};

const updateLocalUserStatus = async ({ username, isActive }) => {
  const target = normalizeText(username, 80).toLowerCase();
  const nextStatus = parseBoolean(isActive, true);
  if (!target) return { error: 'Username inválido.' };
  const pool = await getDbPool();
  const nowIso = new Date().toISOString();

  if (!pool) {
    const index = appUsers.findIndex((entry) => entry.username === target);
    if (index < 0) return { error: 'Usuário não encontrado.' };
    appUsers[index] = { ...appUsers[index], is_active: nextStatus, updated_at: nowIso };
    return { data: await listLocalUsers() };
  }

  const updated = await pool.query(
    `
      UPDATE app_users
      SET is_active = $2, updated_at = $3::timestamptz
      WHERE username = $1
    `,
    [target, nextStatus, nowIso]
  );
  if (!updated.rowCount) {
    return { error: 'Usuário não encontrado.' };
  }
  return { data: await listLocalUsers() };
};

const listGoogleApiKeys = async () => {
  const pool = await getDbPool();
  if (!pool) {
    return [...googleApiKeys]
      .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
      .map((row) => ({
        keyName: row.key_name,
        projectId: row.project_id,
        keyPreview: maskApiKeyPreview(row.api_key),
        isActive: Boolean(row.is_active),
        lastRotatedAt: row.last_rotated_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
  }

  const { rows } = await pool.query(`
    SELECT key_name, api_key, project_id, is_active, last_rotated_at, created_at, updated_at
    FROM google_api_keys
    ORDER BY updated_at DESC
  `);
  return rows.map((row) => ({
    keyName: row.key_name,
    projectId: row.project_id,
    keyPreview: maskApiKeyPreview(row.api_key),
    isActive: Boolean(row.is_active),
    lastRotatedAt: row.last_rotated_at ? new Date(row.last_rotated_at).toISOString() : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  }));
};

const createGoogleApiKey = async (payload = {}) => {
  const keyName = normalizeText(payload.keyName, 120).toLowerCase();
  const apiKey = normalizeText(payload.apiKey, 500);
  const projectId = normalizeNullableText(payload.projectId, 180);
  const notes = normalizeNullableText(payload.notes, 500);
  if (!keyName || !apiKey) {
    return { error: 'Campos obrigatórios: keyName e apiKey.' };
  }
  const nowIso = new Date().toISOString();
  const pool = await getDbPool();

  if (!pool) {
    const exists = googleApiKeys.some((entry) => entry.key_name === keyName);
    if (exists) return { error: 'Já existe uma chave com esse nome.' };
    googleApiKeys.unshift({
      key_name: keyName,
      api_key: apiKey,
      project_id: projectId,
      is_active: true,
      last_rotated_at: nowIso,
      notes,
      created_at: nowIso,
      updated_at: nowIso,
    });
    return { data: await listGoogleApiKeys() };
  }

  const existing = await pool.query('SELECT key_name FROM google_api_keys WHERE key_name = $1 LIMIT 1', [
    keyName,
  ]);
  if (existing.rowCount > 0) {
    return { error: 'Já existe uma chave com esse nome.' };
  }

  await pool.query(
    `
      INSERT INTO google_api_keys (
        key_name, api_key, project_id, is_active, last_rotated_at, notes, created_at, updated_at
      )
      VALUES ($1, $2, $3, TRUE, $4::timestamptz, $5, $6::timestamptz, $7::timestamptz)
    `,
    [keyName, apiKey, projectId, nowIso, notes, nowIso, nowIso]
  );
  return { data: await listGoogleApiKeys() };
};

const updateGoogleApiKeyStatus = async ({ keyName, isActive }) => {
  const target = normalizeText(keyName, 120).toLowerCase();
  const nextStatus = parseBoolean(isActive, true);
  if (!target) return { error: 'keyName inválido.' };
  const nowIso = new Date().toISOString();
  const pool = await getDbPool();

  if (!pool) {
    const index = googleApiKeys.findIndex((entry) => entry.key_name === target);
    if (index < 0) return { error: 'Chave não encontrada.' };
    googleApiKeys[index] = {
      ...googleApiKeys[index],
      is_active: nextStatus,
      updated_at: nowIso,
      last_rotated_at: nowIso,
    };
    return { data: await listGoogleApiKeys() };
  }

  const updated = await pool.query(
    `
      UPDATE google_api_keys
      SET is_active = $2, updated_at = $3::timestamptz, last_rotated_at = $3::timestamptz
      WHERE key_name = $1
    `,
    [target, nextStatus, nowIso]
  );
  if (!updated.rowCount) {
    return { error: 'Chave não encontrada.' };
  }
  return { data: await listGoogleApiKeys() };
};

const mapDbRowToTravelRequest = (row) => ({
  requestId: row.request_id,
  idempotencyKey: row.idempotency_key,
  requester: row.requester,
  tipoSolicitacao: row.tipo_solicitacao,
  origem: row.origem,
  destino: row.destino,
  periodoInicio: row.periodo_inicio ? String(row.periodo_inicio) : '',
  periodoFim: row.periodo_fim ? String(row.periodo_fim) : '',
  kmEstimado: Number(row.km_estimado || 0),
  centroCusto: row.centro_custo,
  totalValue: Number(row.total_value || 0),
  numeroRm: row.numero_rm,
  integrationStatus: row.integration_status,
  retryCount: Number(row.retry_count || 0),
  lastError: row.last_error,
  itens: Array.isArray(row.itens) ? row.itens : [],
  rateio: Array.isArray(row.rateio) ? row.rateio : [],
  anexos: Array.isArray(row.anexos) ? row.anexos : [],
  observacao: row.observacao || '',
  payload: row.payload && typeof row.payload === 'object' ? row.payload : {},
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  integratedAt: row.integrated_at ? new Date(row.integrated_at).toISOString() : null,
});

const loadPersistedTravelRequests = async () => {
  const pool = await getDbPool();
  if (pool) {
    const { rows } = await pool.query(
      `
        SELECT
          request_id, idempotency_key, requester, tipo_solicitacao, origem, destino,
          periodo_inicio, periodo_fim, km_estimado, centro_custo, total_value, numero_rm,
          integration_status, retry_count, last_error, itens, rateio, anexos, observacao,
          payload, created_at, updated_at, integrated_at
        FROM travel_requests
        ORDER BY created_at DESC
        LIMIT $1
      `,
      [TRAVEL_REQUESTS_MAX]
    );
    travelRequests.length = 0;
    for (const row of rows) {
      travelRequests.push(mapDbRowToTravelRequest(row));
    }
    return;
  }

  try {
    const content = await readFile(TRAVEL_REQUESTS_FILE, 'utf8');
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return;
    travelRequests.length = 0;
    for (const row of parsed) {
      if (!row || typeof row !== 'object') continue;
      if (!row.requestId || !row.tipoSolicitacao || !row.origem || !row.destino) continue;
      travelRequests.push(row);
    }
  } catch (_error) {
    // Primeiro boot ou arquivo ausente/corrompido: mantém lista vazia.
  }
};

const persistTravelRequests = async () => {
  const pool = await getDbPool();
  if (pool) {
    const records = travelRequests.slice(0, TRAVEL_REQUESTS_MAX);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM travel_requests');
      for (const record of records) {
        await client.query(
          `
            INSERT INTO travel_requests (
              request_id, idempotency_key, requester, tipo_solicitacao, origem, destino,
              periodo_inicio, periodo_fim, km_estimado, centro_custo, total_value, numero_rm,
              integration_status, retry_count, last_error, itens, rateio, anexos, observacao,
              payload, created_at, updated_at, integrated_at
            )
            VALUES (
              $1, $2, $3, $4, $5, $6,
              $7, $8, $9, $10, $11, $12,
              $13, $14, $15, $16::jsonb, $17::jsonb, $18::jsonb, $19,
              $20::jsonb, $21::timestamptz, $22::timestamptz, $23::timestamptz
            )
          `,
          [
            record.requestId,
            record.idempotencyKey,
            record.requester,
            record.tipoSolicitacao,
            record.origem,
            record.destino,
            record.periodoInicio,
            record.periodoFim,
            Number(record.kmEstimado || 0),
            record.centroCusto,
            Number(record.totalValue || 0),
            record.numeroRm,
            record.integrationStatus,
            Number(record.retryCount || 0),
            record.lastError,
            JSON.stringify(Array.isArray(record.itens) ? record.itens : []),
            JSON.stringify(Array.isArray(record.rateio) ? record.rateio : []),
            JSON.stringify(Array.isArray(record.anexos) ? record.anexos : []),
            record.observacao || '',
            JSON.stringify(record.payload && typeof record.payload === 'object' ? record.payload : {}),
            record.createdAt || new Date().toISOString(),
            record.updatedAt || new Date().toISOString(),
            record.integratedAt || null,
          ]
        );
      }
      await client.query('COMMIT');
      return;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  const dir = path.dirname(TRAVEL_REQUESTS_FILE);
  await mkdir(dir, { recursive: true });
  await writeFile(
    TRAVEL_REQUESTS_FILE,
    JSON.stringify(travelRequests.slice(0, TRAVEL_REQUESTS_MAX), null, 2),
    'utf8'
  );
};

const sanitizeTravelRequestPayload = (payload = {}, fallbackRequester = '') => {
  const tipoSolicitacao = normalizeText(payload.tipoSolicitacao, 120);
  const origem = normalizeText(payload.origem, 255);
  const destino = normalizeText(payload.destino, 255);
  const periodoInicio = normalizeText(payload.periodoInicio, 10);
  const periodoFim = normalizeText(payload.periodoFim, 10);
  const totalValue = parseFiniteNumber(payload.totalValue);

  if (!tipoSolicitacao || !origem || !destino) {
    return { error: 'Campos obrigatórios: tipoSolicitacao, origem e destino.' };
  }
  if (!isIsoDate(periodoInicio) || !isIsoDate(periodoFim)) {
    return { error: 'Campos obrigatórios: periodoInicio e periodoFim no formato YYYY-MM-DD.' };
  }
  if (periodoFim < periodoInicio) {
    return { error: 'periodoFim não pode ser anterior ao periodoInicio.' };
  }
  if (totalValue <= 0) {
    return { error: 'Campo obrigatório: totalValue deve ser maior que zero.' };
  }

  const numeroRm = normalizeNullableText(payload.numeroRm, 40);
  const incomingStatus = normalizeText(payload.integrationStatus, 20).toUpperCase();
  const integrationStatus = VALID_INTEGRATION_STATUS.has(incomingStatus)
    ? incomingStatus
    : numeroRm
    ? INTEGRATION_STATUS.ENVIADO
    : INTEGRATION_STATUS.PENDENTE;

  return {
    requester: normalizeText(payload.requester || fallbackRequester, 80) || 'usuario-desconhecido',
    tipoSolicitacao,
    origem,
    destino,
    periodoInicio,
    periodoFim,
    kmEstimado: parseFiniteNumber(payload.kmEstimado),
    centroCusto: normalizeNullableText(payload.centroCusto, 80),
    totalValue,
    numeroRm,
    integrationStatus,
    retryCount: parsePositiveInt(payload.retryCount, 0),
    lastError: normalizeNullableText(payload.lastError, 1000),
    itens: sanitizeArray(payload.itens),
    rateio: sanitizeArray(payload.rateio),
    anexos: sanitizeArray(payload.anexos),
    observacao: normalizeText(payload.observacao, 2000),
    payload: payload.payload && typeof payload.payload === 'object' ? payload.payload : payload,
  };
};

const loadPersistedRuntimeConfig = async () => {
  try {
    const content = await readFile(BACKEND_CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== 'object') return;
    assignRuntimeConfig(runtimeConfig, parsed);
  } catch (_error) {
    // Primeiro boot ou arquivo ausente/corrompido: mantém config padrão.
  }
};

const loadRuntimeSecrets = async () => {
  try {
    const content = await readFile(BACKEND_SECRETS_FILE, 'utf8');
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== 'object') return;
    assignRuntimeConfig(runtimeConfig, parsed);
  } catch (_error) {
    // Arquivo de segredos é opcional.
  }
};

const persistRuntimeConfig = async () => {
  const dir = path.dirname(BACKEND_CONFIG_FILE);
  const payload = {
    rmApiBaseUrl: runtimeConfig.rmApiBaseUrl,
    rmAuthUsersPath: runtimeConfig.rmAuthUsersPath,
    rmConsultaBasePath: runtimeConfig.rmConsultaBasePath,
  };
  await mkdir(dir, { recursive: true });
  await writeFile(BACKEND_CONFIG_FILE, JSON.stringify(payload, null, 2), 'utf8');
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

    await upsertLocalUser({ username, rmData });

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

app.post('/api/travel-requests', requireAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    const sanitized = sanitizeTravelRequestPayload(payload, req.session?.username || '');
    if (sanitized.error) {
      return res.status(400).json({ message: sanitized.error });
    }

    const requestedId = normalizeText(payload.requestId, 60);
    const requestId =
      requestedId ||
      (() => {
        let nextId = generateTravelRequestId();
        while (travelRequests.some((item) => item.requestId === nextId)) {
          nextId = generateTravelRequestId();
        }
        return nextId;
      })();

    const idempotencyKey = normalizeText(
      req.headers['x-idempotency-key'] || payload.idempotencyKey || requestId,
      120
    );

    const existingByKey = idempotencyKey
      ? travelRequests.find((item) => item.idempotencyKey === idempotencyKey)
      : null;
    if (existingByKey) {
      return res.status(200).json({
        message: 'Solicitação já registrada anteriormente.',
        deduplicated: true,
        request: existingByKey,
      });
    }

    const existingById = travelRequests.find((item) => item.requestId === requestId);
    if (existingById) {
      return res.status(409).json({
        message: 'Já existe uma solicitação com o requestId informado.',
      });
    }

    const nowIso = new Date().toISOString();
    const record = {
      requestId,
      idempotencyKey,
      ...sanitized,
      createdAt: nowIso,
      updatedAt: nowIso,
      integratedAt:
        sanitized.integrationStatus === INTEGRATION_STATUS.INTEGRADO ? nowIso : null,
    };

    travelRequests.unshift(record);
    if (travelRequests.length > TRAVEL_REQUESTS_MAX) {
      travelRequests.length = TRAVEL_REQUESTS_MAX;
    }
    await persistTravelRequests();

    return res.status(201).json({
      message: 'Solicitação registrada no backend.',
      deduplicated: false,
      request: record,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno ao registrar solicitação.',
      details: error?.message || String(error),
    });
  }
});

app.get('/api/travel-requests', requireAuth, (req, res) => {
  const integrationStatus = normalizeText(req.query.integrationStatus, 20).toUpperCase();
  const requester = normalizeText(req.query.requester, 80);
  const q = normalizeText(req.query.q, 120).toLowerCase();
  const limit = Math.min(parsePositiveInt(req.query.limit, 50) || 50, 200);
  const offset = parsePositiveInt(req.query.offset, 0);

  let filtered = [...travelRequests];

  if (VALID_INTEGRATION_STATUS.has(integrationStatus)) {
    filtered = filtered.filter((item) => item.integrationStatus === integrationStatus);
  }
  if (requester) {
    filtered = filtered.filter((item) => item.requester === requester);
  }
  if (q) {
    filtered = filtered.filter((item) => {
      return (
        String(item.requestId || '').toLowerCase().includes(q) ||
        String(item.tipoSolicitacao || '').toLowerCase().includes(q) ||
        String(item.destino || '').toLowerCase().includes(q) ||
        String(item.numeroRm || '').toLowerCase().includes(q)
      );
    });
  }

  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit);
  res.json({ items, total, limit, offset });
});

app.get('/api/travel-requests/queue', requireAuth, (req, res) => {
  const limit = Math.min(parsePositiveInt(req.query.limit, 100) || 100, 500);
  const items = travelRequests
    .filter(
      (item) =>
        item.integrationStatus === INTEGRATION_STATUS.PENDENTE ||
        item.integrationStatus === INTEGRATION_STATUS.ERRO
    )
    .slice(0, limit);
  res.json({ items, total: items.length });
});

app.get('/api/travel-requests/:requestId', requireAuth, (req, res) => {
  const requestId = normalizeText(req.params.requestId, 60);
  const record = travelRequests.find((item) => item.requestId === requestId);
  if (!record) {
    return res.status(404).json({ message: 'Solicitação não encontrada.' });
  }
  return res.json(record);
});

app.patch('/api/travel-requests/:requestId/integration', requireAuth, async (req, res) => {
  try {
    const requestId = normalizeText(req.params.requestId, 60);
    const record = travelRequests.find((item) => item.requestId === requestId);
    if (!record) {
      return res.status(404).json({ message: 'Solicitação não encontrada.' });
    }

    const integrationStatus = normalizeText(req.body?.integrationStatus, 20).toUpperCase();
    if (!VALID_INTEGRATION_STATUS.has(integrationStatus)) {
      return res.status(400).json({
        message: `integrationStatus inválido. Use: ${Array.from(VALID_INTEGRATION_STATUS).join(', ')}.`,
      });
    }

    const numeroRm = normalizeNullableText(req.body?.numeroRm, 40);
    const errorMessage = normalizeNullableText(req.body?.errorMessage, 1000);
    const nowIso = new Date().toISOString();

    if (integrationStatus === INTEGRATION_STATUS.INTEGRADO && !numeroRm && !record.numeroRm) {
      return res.status(400).json({
        message: 'numeroRm é obrigatório para marcar como INTEGRADO.',
      });
    }

    record.integrationStatus = integrationStatus;
    record.updatedAt = nowIso;

    if (numeroRm) {
      record.numeroRm = numeroRm;
    }

    if (integrationStatus === INTEGRATION_STATUS.ERRO) {
      record.retryCount = parsePositiveInt(record.retryCount, 0) + 1;
      record.lastError = errorMessage || 'Erro de integração não informado.';
    } else {
      record.lastError = null;
    }

    if (integrationStatus === INTEGRATION_STATUS.INTEGRADO) {
      record.integratedAt = record.integratedAt || nowIso;
    } else if (integrationStatus !== INTEGRATION_STATUS.ENVIADO) {
      record.integratedAt = null;
    }

    await persistTravelRequests();
    return res.json({
      message: 'Status de integração atualizado.',
      request: record,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno ao atualizar status da integração.',
      details: error?.message || String(error),
    });
  }
});

app.get('/api/admin/users', requireAuth, async (_req, res) => {
  try {
    const items = await listLocalUsers();
    res.json({ items, total: items.length });
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao listar usuários locais.',
      details: error?.message || String(error),
    });
  }
});

app.post('/api/admin/users', requireAuth, async (req, res) => {
  try {
    const result = await createLocalUser(req.body || {});
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }
    return res.status(201).json({
      message: 'Usuário local criado com sucesso.',
      items: result.data,
      total: result.data.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao criar usuário local.',
      details: error?.message || String(error),
    });
  }
});

app.patch('/api/admin/users/:username/status', requireAuth, async (req, res) => {
  try {
    const result = await updateLocalUserStatus({
      username: req.params.username,
      isActive: req.body?.isActive,
    });
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }
    return res.json({
      message: 'Status do usuário atualizado.',
      items: result.data,
      total: result.data.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao atualizar status do usuário.',
      details: error?.message || String(error),
    });
  }
});

app.get('/api/admin/google-api-keys', requireAuth, async (_req, res) => {
  try {
    const items = await listGoogleApiKeys();
    return res.json({ items, total: items.length });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao listar chaves API.',
      details: error?.message || String(error),
    });
  }
});

app.post('/api/admin/google-api-keys', requireAuth, async (req, res) => {
  try {
    const result = await createGoogleApiKey(req.body || {});
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }
    return res.status(201).json({
      message: 'Chave API criada com sucesso.',
      items: result.data,
      total: result.data.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao criar chave API.',
      details: error?.message || String(error),
    });
  }
});

app.patch('/api/admin/google-api-keys/:keyName/status', requireAuth, async (req, res) => {
  try {
    const result = await updateGoogleApiKeyStatus({
      keyName: req.params.keyName,
      isActive: req.body?.isActive,
    });
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }
    return res.json({
      message: 'Status da chave API atualizado.',
      items: result.data,
      total: result.data.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao atualizar status da chave API.',
      details: error?.message || String(error),
    });
  }
});

app.get('/api/admin/runtime-config', requireAuth, (_req, res) => {
  res.json({
    rmApiBaseUrl: runtimeConfig.rmApiBaseUrl,
    rmAuthUsersPath: runtimeConfig.rmAuthUsersPath,
    rmConsultaBasePath: runtimeConfig.rmConsultaBasePath,
    hasGoogleMapsApiKey: Boolean(runtimeConfig.googleMapsApiKey),
    googleMapsApiKeyPreview: maskApiKeyPreview(runtimeConfig.googleMapsApiKey),
  });
});

app.post('/api/admin/runtime-config', requireAuth, (req, res) => {
  const { rmApiBaseUrl, rmAuthUsersPath, rmConsultaBasePath, googleMapsApiKey } = req.body || {};

  if (rmApiBaseUrl) runtimeConfig.rmApiBaseUrl = String(rmApiBaseUrl).trim();
  if (rmAuthUsersPath) runtimeConfig.rmAuthUsersPath = String(rmAuthUsersPath).trim();
  if (rmConsultaBasePath) runtimeConfig.rmConsultaBasePath = String(rmConsultaBasePath).trim();
  if (googleMapsApiKey !== undefined) {
    return res.status(400).json({
      message:
        'googleMapsApiKey não pode ser alterada por esta rota. Use GOOGLE_MAPS_API_KEY no ambiente ou BACKEND_SECRETS_FILE no backend.',
    });
  }

  persistRuntimeConfig()
    .then(() => {
      res.json({
        message: 'Configurações atualizadas e persistidas no backend.',
        runtimeConfig: {
          rmApiBaseUrl: runtimeConfig.rmApiBaseUrl,
          rmAuthUsersPath: runtimeConfig.rmAuthUsersPath,
          rmConsultaBasePath: runtimeConfig.rmConsultaBasePath,
          hasGoogleMapsApiKey: Boolean(runtimeConfig.googleMapsApiKey),
          googleMapsApiKeyPreview: maskApiKeyPreview(runtimeConfig.googleMapsApiKey),
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

Promise.resolve()
  .then(() => initDatabase())
  .then(() => Promise.all([loadPersistedRuntimeConfig(), loadRuntimeSecrets(), loadPersistedTravelRequests()]))
  .then(() => Promise.all([persistRuntimeConfig(), persistTravelRequests()]))
  .catch((error) => {
    console.error('Erro ao inicializar backend:', error?.message || String(error));
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
      console.log(`Runtime config file: ${BACKEND_CONFIG_FILE}`);
      console.log(
        dbStorageEnabled
          ? 'Travel requests storage: PostgreSQL'
          : `Travel requests file: ${TRAVEL_REQUESTS_FILE}`
      );
    });
  });
