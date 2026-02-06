// Login

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, CheckCircle, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { loginUser } from '../services';
import API_CONFIG from '../config/api.config';
import { useTheme } from '../hooks/useTheme';

const LoginPage = () => {
  const navigate = useNavigate();
  
  // Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();

  // Validate user
  const validateEmail = (email) => {
    return email.trim().length > 0;
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Usuário é obrigatório');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Senha é obrigatória');
      isValid = false;
    } else if (password.length < 3) {
      setPasswordError('Senha deve ter no mínimo 3 caracteres');
      isValid = false;
    }

    return isValid;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');
    setSuccess('');

    setIsLoading(true);

    try {
      const response = await loginUser(email, password);

      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      setSuccess('Login realizado com sucesso! Redirecionando...');

      setTimeout(() => {
        navigate('/tarefas');
      }, 1500);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Usuário ou senha incorretos');
      } else if (err.response?.status === 404) {
        setError('Usuário não encontrado');
      } else if (err.response?.status === 429) {
        setError('Muitas tentativas de login. Tente novamente mais tarde.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Tempo limite excedido. Verifique sua conexão.');
      } else if (err.message === 'Network Error') {
        setError('Erro de conexão. Verifique sua internet e a URL da API.');
      } else {
        setError(err.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
      }

      if (API_CONFIG.GENERAL.DEBUG) {
        console.error('Erro de login:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved email
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <Card className="border-graphite-200 bg-white shadow-sm dark:border-graphite-800 dark:bg-graphite-950">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                aria-pressed={isDarkMode}
                className="text-graphite-600 hover:text-black dark:text-graphite-300 dark:hover:text-white"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                {isDarkMode ? 'Tema claro' : 'Tema escuro'}
              </Button>
            </div>
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center dark:bg-white">
                <Lock className="text-white dark:text-black" size={22} />
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-graphite-500 dark:text-graphite-400">
              Central RM
            </p>
            <CardTitle className="text-2xl font-semibold text-black dark:text-white">
              Interface Web para o Seu ERP 
            </CardTitle>
            <CardDescription className="text-graphite-600 dark:text-graphite-400">
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 dark:bg-red-950/40 dark:border-red-900">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5 dark:text-red-300" size={20} />
                <p className="text-red-700 text-sm dark:text-red-200">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3 dark:bg-green-950/40 dark:border-green-900">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5 dark:text-green-300" size={20} />
                <p className="text-green-700 text-sm dark:text-green-200">{success}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-graphite-700 mb-2 dark:text-graphite-300">
                  Usuário
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-500 dark:text-graphite-400" size={18} />
                  <Input
                    id="email"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                      setError('');
                    }}
                    disabled={isLoading}
                    className={`pl-9 ${emailError ? 'border-red-500 focus-visible:ring-red-200' : 'border-graphite-200 focus-visible:ring-graphite-200 dark:border-graphite-700 dark:focus-visible:ring-graphite-700'}`}
                  />
                  {emailError && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{emailError}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-graphite-700 mb-2 dark:text-graphite-300">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-500 dark:text-graphite-400" size={18} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                      setError('');
                    }}
                    disabled={isLoading}
                    className={`pl-9 ${passwordError ? 'border-red-500 focus-visible:ring-red-200' : 'border-graphite-200 focus-visible:ring-graphite-200 dark:border-graphite-700 dark:focus-visible:ring-graphite-700'}`}
                  />
                  {passwordError && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{passwordError}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-graphite-400 text-black focus:ring-graphite-200 cursor-pointer dark:border-graphite-600 dark:text-white dark:focus:ring-graphite-700"
                  />
                  <span className="text-sm text-graphite-500 dark:text-graphite-300">Lembrar-me</span>
                </label>
              </div>

              <Button type="submit" variant="default" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Carregando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>

          <Separator />
          <CardFooter className="justify-center text-sm text-graphite-500 dark:text-graphite-500">
            <p>Versão 1.0 (inicial) - Desenvolvido por Diego Bueno</p>
          </CardFooter>
        </Card>

        {API_CONFIG.GENERAL.DEBUG && (
          <div className="mt-4 p-4 bg-white border border-graphite-200 rounded-lg text-xs text-graphite-600 dark:bg-graphite-950 dark:border-graphite-800 dark:text-graphite-400">
            <p className="font-mono">API: {API_CONFIG.BASE_URL}</p>
            <p className="font-mono">Auth: {API_CONFIG.AUTH_CONFIG.TYPE}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
