// API config

const API_CONFIG = {
  // Base URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://dbs.brazilsouth.cloudapp.azure.com:8051',

  // Endpoints
  AUTH: {
    USERS: '/api/framework/v1/users',
    LOGIN: '/api/framework/v1/users',
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
