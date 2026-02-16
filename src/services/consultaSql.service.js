// Consulta SQL service

import API_CONFIG from '../config/api.config';
import apiClient from './apiClient';

export const buildConsultaSqlUrl = ({
  codSentenca,
  codColigada,
  codSistema,
  parameters,
  context,
  useUppercaseParameters = API_CONFIG.CONSULTA_SQL.USE_UPPERCASE_PARAMS,
  encodeQuery = API_CONFIG.CONSULTA_SQL.ENCODE_QUERY,
  basePath = API_CONFIG.CONSULTA_SQL.BASE_PATH,
}) => {
  if (!codSentenca || codColigada === null || codColigada === undefined || !codSistema) {
    return '';
  }

  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const queryParts = [];
  const encode = encodeQuery ? encodeURIComponent : (value) => value;
  const paramKey = useUppercaseParameters
    ? API_CONFIG.CONSULTA_SQL.PARAM_KEYS.PARAMETERS
    : 'parameters';
  const contextKey = useUppercaseParameters
    ? API_CONFIG.CONSULTA_SQL.PARAM_KEYS.CONTEXT
    : 'context';

  if (parameters) {
    queryParts.push(`${paramKey}=${encode(parameters)}`);
  }

  if (context) {
    queryParts.push(`${contextKey}=${encode(context)}`);
  }

  const queryString = queryParts.join('&');
  return `${baseUrl}${basePath}/${codSentenca}/${codColigada}/${codSistema}/${
    queryString ? `?${queryString}` : ''
  }`;
};

export const buildConsultaSqlPath = ({
  codSentenca,
  codColigada,
  codSistema,
  parameters,
  context,
  useUppercaseParameters = API_CONFIG.CONSULTA_SQL.USE_UPPERCASE_PARAMS,
  encodeQuery = API_CONFIG.CONSULTA_SQL.ENCODE_QUERY,
  basePath = API_CONFIG.CONSULTA_SQL.BASE_PATH,
}) => {
  if (!codSentenca || codColigada === null || codColigada === undefined || !codSistema) {
    return '';
  }

  const queryParts = [];
  const encode = encodeQuery ? encodeURIComponent : (value) => value;
  const paramKey = useUppercaseParameters
    ? API_CONFIG.CONSULTA_SQL.PARAM_KEYS.PARAMETERS
    : 'parameters';
  const contextKey = useUppercaseParameters
    ? API_CONFIG.CONSULTA_SQL.PARAM_KEYS.CONTEXT
    : 'context';

  if (parameters) {
    queryParts.push(`${paramKey}=${encode(parameters)}`);
  }

  if (context) {
    queryParts.push(`${contextKey}=${encode(context)}`);
  }

  const queryString = queryParts.join('&');
  return `${basePath}/${codSentenca}/${codColigada}/${codSistema}/${
    queryString ? `?${queryString}` : ''
  }`;
};

export const getConsultaSql = async ({
  codSentenca,
  codColigada,
  codSistema,
  parameters,
  context,
  useUppercaseParameters = API_CONFIG.CONSULTA_SQL.USE_UPPERCASE_PARAMS,
  encodeQuery = API_CONFIG.CONSULTA_SQL.ENCODE_QUERY,
  basePath = API_CONFIG.CONSULTA_SQL.BASE_PATH,
}) => {
  const payload = {
    codSentenca,
    codColigada,
    codSistema,
    parameters,
    context,
    useUppercaseParameters,
    encodeQuery,
    basePath,
  };

  if (!buildConsultaSqlPath(payload)) {
    throw new Error('Parâmetros inválidos para Consulta SQL');
  }

  const response = await apiClient.post(API_CONFIG.CONSULTA_SQL.BACKEND_ENDPOINT, payload);
  return response.data;
};
