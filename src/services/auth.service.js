// Auth service

import API_CONFIG from '../config/api.config';
import apiClient from './apiClient';

export const loginUser = async (username, password) => {
  try {
    const credentials = btoa(`${username}:${password}`);

    const response = await apiClient.get(`${API_CONFIG.AUTH.USERS}/${username}`, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    localStorage.setItem('user_data', JSON.stringify(response.data));

    if (API_CONFIG.GENERAL.DEBUG) {
      console.log('Login bem-sucedido:', response.data);
    }

    return response.data;
  } catch (error) {
    if (API_CONFIG.GENERAL.DEBUG) {
      console.error('Erro ao fazer login:', error);
    }
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.removeItem('user_data');

    if (API_CONFIG.GENERAL.DEBUG) {
      console.log('Logout bem-sucedido');
    }

    return true;
  } catch (error) {
    if (API_CONFIG.GENERAL.DEBUG) {
      console.error('Erro ao fazer logout:', error);
    }
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.removeItem('user_data');
    throw error;
  }
};

export const getUserInfo = async () => {
  try {
    const username = localStorage.getItem('username');

    if (!username) {
      throw new Error('Usuário não autenticado');
    }

    const response = await apiClient.get(`${API_CONFIG.AUTH.USERS}/${username}`);

    if (API_CONFIG.GENERAL.DEBUG) {
      console.log('Informações do usuário:', response.data);
    }

    return response.data;
  } catch (error) {
    if (API_CONFIG.GENERAL.DEBUG) {
      console.error('Erro ao obter informações do usuário:', error);
    }
    throw error;
  }
};

export const isAuthenticated = () => {
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  return !!(username && password);
};
