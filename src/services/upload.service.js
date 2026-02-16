import apiClient from './apiClient';

export const uploadFiles = async (files = []) => {
  if (!files.length) {
    return [];
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiClient.post('/api/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response?.data?.files || [];
};

