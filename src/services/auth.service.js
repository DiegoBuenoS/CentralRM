// Auth service

import API_CONFIG from '../config/api.config';
import apiClient from './apiClient';

export const loginUser = async (username, password) => {
  try {
    const response = await apiClient.post(API_CONFIG.AUTH.LOGIN, {
      username,
      password,
    });

    const token = response?.data?.token;
    const user = response?.data?.user;
    if (!token || !user) {
      throw new Error('Resposta inválida do backend no login.');
    }

    localStorage.setItem('session_token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('user_data', JSON.stringify(user));

    return user;
  } catch (error) {
    if (API_CONFIG.GENERAL.DEBUG) {
      console.error('Erro ao fazer login:', error);
    }
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    if (localStorage.getItem('session_token')) {
      await apiClient.post(API_CONFIG.AUTH.LOGOUT);
    }
  } catch {
    // Continua limpando sessão local mesmo em falha remota.
  }

  try {
    localStorage.removeItem('session_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_data');

    return true;
  } catch (error) {
    if (API_CONFIG.GENERAL.DEBUG) {
      console.error('Erro ao fazer logout:', error);
    }
    localStorage.removeItem('session_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_data');
    throw error;
  }
};

export const getUserInfo = async () => {
  try {
    const token = localStorage.getItem('session_token');
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await apiClient.get(API_CONFIG.AUTH.ME);

    return response.data;
  } catch (error) {
    if (API_CONFIG.GENERAL.DEBUG) {
      console.error('Erro ao obter informações do usuário:', error);
    }
    throw error;
  }
};

export const isAuthenticated = () => {
  const sessionToken = localStorage.getItem('session_token');
  return !!sessionToken;
};
