import apiClient from './apiClient';

export const createTravelRequest = async (payload) => {
  const response = await apiClient.post('/api/travel-requests', payload);
  return response?.data || null;
};

export const listTravelRequests = async (params = {}) => {
  const response = await apiClient.get('/api/travel-requests', { params });
  return response?.data || { items: [], total: 0, limit: 0, offset: 0 };
};

export const updateTravelRequestIntegration = async (requestId, payload) => {
  const response = await apiClient.patch(`/api/travel-requests/${requestId}/integration`, payload);
  return response?.data || null;
};
