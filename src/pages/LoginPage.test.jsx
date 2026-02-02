// Login page tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import * as apiService from '../services/auth.service';
import { MemoryRouter } from 'react-router-dom';

// API mock
vi.mock('../services/auth.service');

describe('Página de Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderWithRouter = () =>
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

  it('deve renderizar o formulário de login', () => {
    renderWithRouter();
    
    expect(screen.getByText('Central de Aprovações')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuário')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('deve validar usuário obrigatório', async () => {
    renderWithRouter();
    
    const button = screen.getByRole('button', { name: 'Entrar' });
    await userEvent.click(button);
    
    expect(screen.getByText('Usuário é obrigatório')).toBeInTheDocument();
  });

  it('deve validar senha obrigatória', async () => {
    renderWithRouter();
    
    const emailInput = screen.getByLabelText('Usuário');
    const button = screen.getByRole('button', { name: 'Entrar' });
    
    await userEvent.type(emailInput, 'usuario@email.com');
    await userEvent.click(button);
    
    expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
  });

  it('deve validar comprimento mínimo da senha', async () => {
    renderWithRouter();
    
    const emailInput = screen.getByLabelText('Usuário');
    const passwordInput = screen.getByLabelText('Senha');
    const button = screen.getByRole('button', { name: 'Entrar' });
    
    await userEvent.type(emailInput, 'usuario@email.com');
    await userEvent.type(passwordInput, '12');
    await userEvent.click(button);
    
    expect(screen.getByText('Senha deve ter no mínimo 3 caracteres')).toBeInTheDocument();
  });

  it('deve fazer login com sucesso', async () => {
    apiService.loginUser.mockResolvedValue({
      access_token: 'token_acesso',
      refresh_token: 'refresh_token',
    });

    renderWithRouter();
    
    const emailInput = screen.getByLabelText('Usuário');
    const passwordInput = screen.getByLabelText('Senha');
    const button = screen.getByRole('button', { name: 'Entrar' });
    
    await userEvent.type(emailInput, 'usuario@email.com');
    await userEvent.type(passwordInput, 'senha123');
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Login realizado com sucesso/)).toBeInTheDocument();
    });
  });

  it('deve exibir erro ao falhar login', async () => {
    apiService.loginUser.mockRejectedValue({
      response: {
        status: 401,
        data: { message: 'Usuário ou senha incorretos' },
      },
    });

    renderWithRouter();
    
    const emailInput = screen.getByLabelText('Usuário');
    const passwordInput = screen.getByLabelText('Senha');
    const button = screen.getByRole('button', { name: 'Entrar' });
    
    await userEvent.type(emailInput, 'usuario@email.com');
    await userEvent.type(passwordInput, 'senha_errada');
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Usuário ou senha incorretos')).toBeInTheDocument();
    });
  });

  it('deve salvar email quando "Lembrar-me" está marcado', async () => {
    apiService.loginUser.mockResolvedValue({
      access_token: 'token_acesso',
    });

    renderWithRouter();
    
    const emailInput = screen.getByLabelText('Usuário');
    const passwordInput = screen.getByLabelText('Senha');
    const rememberCheckbox = screen.getByRole('checkbox', { name: /Lembrar-me/ });
    const button = screen.getByRole('button', { name: 'Entrar' });
    
    await userEvent.type(emailInput, 'usuario@email.com');
    await userEvent.type(passwordInput, 'senha123');
    await userEvent.click(rememberCheckbox);
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'rememberEmail',
        'usuario@email.com'
      );
    });
  });

  it('deve desabilitar botão durante carregamento', async () => {
    apiService.loginUser.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    renderWithRouter();
    
    const emailInput = screen.getByLabelText('Usuário');
    const passwordInput = screen.getByLabelText('Senha');
    const button = screen.getByRole('button', { name: 'Entrar' });
    
    await userEvent.type(emailInput, 'usuario@email.com');
    await userEvent.type(passwordInput, 'senha123');
    await userEvent.click(button);
    
    expect(button).toBeDisabled();
  });
});
