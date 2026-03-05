import { apiRequest } from './apiClient';
import { clearSession, saveSession } from '../lib/sessionStorage';

export const loginUser = async ({ username, password }) => {
  const payload = await apiRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { username, password },
  });

  const token = payload?.token;
  const user = payload?.user;

  if (!token || !user) {
    throw new Error('Resposta inválida no login.');
  }

  await saveSession({ token, user });
  return { token, user };
};

export const logoutUser = async (token) => {
  try {
    if (token) {
      await apiRequest({ method: 'POST', path: '/api/auth/logout', token });
    }
  } finally {
    await clearSession();
  }
};
