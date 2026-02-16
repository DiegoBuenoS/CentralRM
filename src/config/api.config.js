// API config

const API_CONFIG = {
  // Base URL
  BASE_URL: import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8787',

  // Endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },

  // Auth
  AUTH_CONFIG: {
    TYPE: 'basic',
    CONTEXT: import.meta.env.VITE_CONTEXT || '1',
    HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },

  // Consulta SQL
  CONSULTA_SQL: {
    BASE_PATH: '/api/framework/v1/consultaSQLServer/RealizaConsulta',
    BACKEND_ENDPOINT: '/api/rm/consulta-sql',
    COD_COLIGADA_PATH: 0,
    COD_SISTEMA: 'G',
    COD_COLIGADA_PARAM: 1,
    USE_UPPERCASE_PARAMS: true,
    ENCODE_QUERY: false,
    PARAM_KEYS: {
      PARAMETERS: 'PARAMETERS',
      CONTEXT: 'CONTEXT',
    },
    SENTENCAS: {
      TIPO_SOLICITACAO: 'INT.001',
      CENTRO_CUSTO: 'INT.002',
    },
    PARAMS: {
      USUARIO: 'usuario',
      CODCOLIGADA: 'codcoligada',
    },
  },

  // General
  GENERAL: {
    REQUEST_TIMEOUT: 30000,
    DEBUG: import.meta.env.MODE === 'development',
    API_VERSION: 'v1',
  },
};

export default API_CONFIG;
