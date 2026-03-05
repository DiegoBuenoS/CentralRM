import { getApiBaseUrl } from '../config/api';

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const apiRequest = async ({ method = 'GET', path, token, body, query }) => {
  const baseUrl = getApiBaseUrl();
  const url = new URL(path, baseUrl);

  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    const error = new Error(payload?.message || 'Falha na requisição.');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};
