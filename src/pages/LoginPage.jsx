// Login

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  MoonIcon,
  SunIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await loginUser(email, password);

      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      setSuccess('Login realizado com sucesso! Redirecionando...');

      setTimeout(() => {
        navigate('/despesas-viagens');
      }, 1200);
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
        setError(`Erro de conexão com o backend (${API_CONFIG.BASE_URL}). Verifique se o servidor está ativo.`);
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

  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-mist">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <Card className="border-graphite-200 bg-white">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.12em] text-graphite-600">Acesso Corporativo</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  aria-pressed={isDarkMode}
                  className="text-graphite-600 hover:text-graphite-900"
                >
                  {isDarkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
                  <LockClosedIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-[1.55rem]">Entrar no RM Despesas</CardTitle>
                  <CardDescription>Use suas credenciais para continuar.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start space-x-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <ExclamationCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-graphite-700">
                    Usuário
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-500" />
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
                      className={`pl-9 h-11 ${emailError ? 'border-red-500 focus-visible:ring-red-200' : 'bg-graphite-50'}`}
                    />
                    {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="block text-[13px] font-medium text-graphite-700">
                      Senha
                    </label>
                    <button type="button" className="text-[12px] font-medium text-graphite-500 hover:text-graphite-800">
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-500" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                        setError('');
                      }}
                      onKeyUp={(event) => {
                        setCapsLockOn(event.getModifierState('CapsLock'));
                      }}
                      onBlur={() => setCapsLockOn(false)}
                      disabled={isLoading}
                      className={`pl-9 pr-10 h-11 ${passwordError ? 'border-red-500 focus-visible:ring-red-200' : 'bg-graphite-50'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite-500 hover:text-graphite-800"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                    {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
                  </div>
                  {capsLockOn && <p className="mt-1 text-xs text-amber-700">Caps Lock ativado.</p>}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                      className="h-4 w-4 cursor-pointer rounded border-graphite-300 text-primary focus:ring-graphite-300"
                    />
                    <span className="text-sm text-graphite-600">Lembrar-me</span>
                  </label>
                  <span className="text-[12px] text-graphite-500">Ambiente seguro</span>
                </div>

                <Button type="submit" variant="default" size="lg" className="h-11 w-full font-semibold" disabled={isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>

            <Separator />
            <CardFooter className="flex-col items-center justify-center gap-1 text-[12px] text-graphite-500">
              <p>Desenvolvido por Diego Bueno</p>
              <p>versão beta</p>
            </CardFooter>
          </Card>

          {API_CONFIG.GENERAL.DEBUG && (
            <div className="mt-4 rounded-lg border border-graphite-200 bg-white p-4 text-xs text-graphite-600">
              <p className="font-mono">API: {API_CONFIG.BASE_URL}</p>
              <p className="font-mono">Auth: {API_CONFIG.AUTH_CONFIG.TYPE}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
