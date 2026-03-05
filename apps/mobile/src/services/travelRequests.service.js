import { apiRequest } from './apiClient';

export const createTravelRequest = async ({ token, payload }) => {
  const data = await apiRequest({
    method: 'POST',
    path: '/api/travel-requests',
    token,
    body: payload,
  });

  return data?.request || null;
};

export const listTravelRequests = async ({ token, limit = 50, offset = 0, q = '' }) => {
  const payload = await apiRequest({
    method: 'GET',
    path: '/api/travel-requests',
    token,
    query: {
      limit,
      offset,
      q,
    },
  });

  return {
    items: payload?.items || [],
    total: Number(payload?.total || 0),
    limit: Number(payload?.limit || limit),
    offset: Number(payload?.offset || offset),
  };
};
