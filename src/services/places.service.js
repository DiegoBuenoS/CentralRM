import apiClient from './apiClient';

export const getPlaceSuggestions = async (input) => {
  if (!input || input.trim().length < 3) {
    return [];
  }

  try {
    const response = await apiClient.post('/api/maps/autocomplete', { input });
    return response?.data?.suggestions || [];
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || 'Não foi possível buscar sugestões.';
    throw new Error(message);
  }
};

