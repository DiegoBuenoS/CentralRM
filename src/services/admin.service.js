import apiClient from './apiClient';

export const listLocalUsers = async () => {
  const { data } = await apiClient.get('/api/admin/users');
  return data?.items || [];
};

export const createLocalUser = async (payload) => {
  const { data } = await apiClient.post('/api/admin/users', payload);
  return data?.items || [];
};

export const updateLocalUserStatus = async ({ username, isActive }) => {
  const { data } = await apiClient.patch(
    `/api/admin/users/${encodeURIComponent(username)}/status`,
    { isActive }
  );
  return data?.items || [];
};

export const listGoogleApiKeys = async () => {
  const { data } = await apiClient.get('/api/admin/google-api-keys');
  return data?.items || [];
};

export const createGoogleApiKey = async (payload) => {
  const { data } = await apiClient.post('/api/admin/google-api-keys', payload);
  return data?.items || [];
};

export const updateGoogleApiKeyStatus = async ({ keyName, isActive }) => {
  const { data } = await apiClient.patch(
    `/api/admin/google-api-keys/${encodeURIComponent(keyName)}/status`,
    { isActive }
  );
  return data?.items || [];
};
