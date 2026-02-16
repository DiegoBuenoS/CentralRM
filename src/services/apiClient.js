// API client

import axios from 'axios';
import API_CONFIG from '../config/api.config';
import { getRuntimeConfig } from '../config/runtime.config';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.GENERAL.REQUEST_TIMEOUT,
  headers: API_CONFIG.AUTH_CONFIG.HEADERS,
});

apiClient.interceptors.request.use(
  (config) => {
    const runtimeConfig = getRuntimeConfig();
    config.baseURL = runtimeConfig.backendBaseUrl || API_CONFIG.BASE_URL;
    const sessionToken = localStorage.getItem('session_token');

    if (sessionToken) {
      config.headers.Authorization = `Bearer ${sessionToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('session_token');
      localStorage.removeItem('user_data');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
