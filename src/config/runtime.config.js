const STORAGE_KEY = 'app_runtime_config';

export const DEFAULT_RUNTIME_CONFIG = {
  backendBaseUrl: import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8787',
  rmApiBaseUrl: import.meta.env.RM_API_BASE_URL || 'http://dbs.brazilsouth.cloudapp.azure.com:8051',
  rmAuthUsersPath: import.meta.env.RM_AUTH_USERS_PATH || '/api/framework/v1/users',
  rmConsultaBasePath:
    import.meta.env.RM_CONSULTA_BASE_PATH || '/api/framework/v1/consultaSQLServer/RealizaConsulta',
  googleMapsApiKey: '',
};

const readStoredConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getRuntimeConfig = () => ({
  ...DEFAULT_RUNTIME_CONFIG,
  ...readStoredConfig(),
});

export const saveRuntimeConfig = (config) => {
  const merged = {
    ...DEFAULT_RUNTIME_CONFIG,
    ...(config || {}),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
};

export const RUNTIME_CONFIG_STORAGE_KEY = STORAGE_KEY;

