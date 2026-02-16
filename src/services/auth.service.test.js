// API service tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loginUser, logoutUser, getUserInfo } from './auth.service';
import apiClient from './apiClient';

vi.mock('./apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Serviço de Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'removeItem');
    localStorage.getItem = vi.fn().mockReturnValue(null);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loginUser', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const mockResponse = {
        data: {
          token: 'session-token-1',
          user: {
            id: '123',
            name: 'Usuário Teste',
          },
        },
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const result = await loginUser('usuario@email.com', 'senha123');

      expect(result).toEqual(mockResponse.data.user);
      expect(localStorage.setItem).toHaveBeenCalledWith('session_token', 'session-token-1');
      expect(localStorage.setItem).toHaveBeenCalledWith('username', 'usuario@email.com');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify(mockResponse.data.user)
      );
    });

    it('deve lançar erro com credenciais inválidas', async () => {
      const mockError = new Error('Credenciais inválidas');

      apiClient.post.mockRejectedValue(mockError);

      await expect(loginUser('usuario@email.com', 'senha_errada')).rejects.toThrow();
    });
  });

  describe('logoutUser', () => {
    it('deve fazer logout com sucesso', async () => {
      localStorage.setItem('username', 'usuario@email.com');
      localStorage.setItem('session_token', 'session-token-1');
      localStorage.setItem('user_data', JSON.stringify({ id: '123' }));
      apiClient.post.mockResolvedValue({ data: { success: true } });

      const result = await logoutUser();

      expect(result).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('session_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('username');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data');
    });
  });

  describe('getUserInfo', () => {
    it('deve obter informações do usuário', async () => {
      const mockResponse = {
        data: {
          sub: '123',
          email: 'usuario@email.com',
          name: 'Usuário Teste',
        },
      };

      localStorage.getItem = vi.fn((key) =>
        key === 'session_token' ? 'session-token-1' : null
      );
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await getUserInfo();

      expect(result).toEqual(mockResponse.data);
    });

    it('deve lançar erro quando usuário não está autenticado', async () => {
      await expect(getUserInfo()).rejects.toThrow('Usuário não autenticado');
    });
  });
});
