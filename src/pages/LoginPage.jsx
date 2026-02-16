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
  ShieldCheckIcon,
  SparklesIcon,
  BoltIcon,
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
  const stagger = (delay) => ({
    animationDelay: `${delay}ms`,
    animationFillMode: 'both',
  });
  
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
      await loginUser(email, password);

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

  // Load saved email
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50/80 px-4 py-6 sm:px-6 sm:py-10 dark:bg-[#0e1520]">
      <div className="pointer-events-none absolute inset-0 motion-safe:animate-fade-in" style={stagger(40)}>
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/16 motion-safe:animate-pulse-soft" />
        <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-500/14 motion-safe:animate-pulse-soft" style={stagger(140)} />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-slate-300/20 blur-3xl dark:bg-slate-400/10 motion-safe:animate-pulse-soft" style={stagger(240)} />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <section
          className="hidden rounded-3xl border border-slate-200/90 bg-white/60 p-10 backdrop-blur-2xl dark:border-slate-700 dark:bg-slate-900/60 motion-safe:animate-slide-up"
          style={stagger(90)}
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 motion-safe:animate-fade-in" style={stagger(160)}>
            <SparklesIcon className="h-3.5 w-3.5" />
            Plataforma RM
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100 motion-safe:animate-slide-up" style={stagger(200)}>
            Gestão operacional moderna para decisões mais rápidas.
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 motion-safe:animate-slide-up" style={stagger(260)}>
            Conecte compras, estoque, faturamento e orçamento em uma experiência visual clara, consistente e preparada para uso diário.
          </p>

          <div className="mt-8 grid gap-3">
            <div className="rounded-xl border border-slate-200 bg-white/75 p-3 dark:border-slate-700 dark:bg-slate-900/70 motion-safe:animate-slide-up" style={stagger(320)}>
              <p className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                <BoltIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                Fluxos mais rápidos de ponta a ponta
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Menos cliques para executar tarefas críticas do dia.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/75 p-3 dark:border-slate-700 dark:bg-slate-900/70 motion-safe:animate-slide-up" style={stagger(380)}>
              <p className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                <ShieldCheckIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                Segurança e consistência operacional
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Login integrado ao RM com ambiente corporativo confiável.
              </p>
            </div>
          </div>
        </section>

        <div className="w-full max-w-md motion-safe:animate-slide-up" style={stagger(140)}>
          <Card className="border border-slate-200 bg-white/90 shadow-[0_36px_90px_-32px_rgba(15,23,42,0.52)] backdrop-blur-2xl dark:border-slate-600/70 dark:bg-[#121b28]/90 dark:shadow-[0_30px_80px_-30px_rgba(2,8,20,0.72)]">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between motion-safe:animate-fade-in" style={stagger(200)}>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">Central RM</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  aria-pressed={isDarkMode}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  {isDarkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                  {isDarkMode ? 'Tema claro' : 'Tema escuro'}
                </Button>
              </div>
              <div className="flex items-center gap-3 motion-safe:animate-slide-up" style={stagger(240)}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 shadow-sm dark:bg-cyan-100">
                  <LockClosedIcon className="h-5 w-5 text-white dark:text-cyan-900" />
                </div>
                <div>
                  <CardTitle className="text-[1.65rem] font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    Entrar no RM
                  </CardTitle>
                  <CardDescription className="text-[13px] text-slate-600 dark:text-slate-300">
                    Use suas credenciais corporativas para continuar.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start space-x-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/40 dark:bg-red-500/10 motion-safe:animate-fade-in">
                  <ExclamationCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-300" />
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start space-x-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-emerald-500/40 dark:bg-emerald-500/10 motion-safe:animate-fade-in">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-emerald-300" />
                  <p className="text-sm text-green-700 dark:text-emerald-200">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="motion-safe:animate-slide-up" style={stagger(300)}>
                  <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-slate-200">
                    Usuário
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-300" />
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
                      className={`pl-9 h-11 text-[14px] ${emailError ? 'border-red-500 focus-visible:ring-red-200 dark:border-red-400 dark:focus-visible:ring-red-500/40' : 'border-slate-300 bg-slate-100/80 focus-visible:ring-slate-300 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:border-cyan-400/60 dark:focus-visible:ring-cyan-500/30'}`}
                    />
                    {emailError && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{emailError}</p>}
                  </div>
                </div>

                <div className="motion-safe:animate-slide-up" style={stagger(340)}>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="block text-[13px] font-medium text-slate-700 dark:text-slate-200">
                      Senha
                    </label>
                    <button
                      type="button"
                      className="text-[12px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-300" />
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
                      className={`pl-9 pr-10 h-11 text-[14px] ${passwordError ? 'border-red-500 focus-visible:ring-red-200 dark:border-red-400 dark:focus-visible:ring-red-500/40' : 'border-slate-300 bg-slate-100/80 focus-visible:ring-slate-300 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:border-cyan-400/60 dark:focus-visible:ring-cyan-500/30'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                    {passwordError && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{passwordError}</p>}
                  </div>
                  {capsLockOn && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-200">
                      Caps Lock ativado.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between motion-safe:animate-slide-up" style={stagger(380)}>
                  <label className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                      className="h-4 w-4 cursor-pointer rounded border-slate-400 text-slate-900 focus:ring-slate-300 dark:border-slate-500 dark:bg-slate-800 dark:text-cyan-300 dark:focus:ring-cyan-500/40"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-200">Lembrar-me</span>
                  </label>
                  <span className="text-[12px] text-slate-500 dark:text-slate-300">Ambiente seguro</span>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="w-full h-11 bg-slate-900 font-semibold tracking-tight hover:bg-slate-800 dark:bg-cyan-300 dark:text-slate-900 dark:hover:bg-cyan-200 motion-safe:animate-slide-up"
                  style={stagger(420)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>

            <Separator />
            <CardFooter className="justify-between gap-2 text-[12px] text-slate-500 dark:text-slate-300">
              <p>Versão 1.0</p>
              <p>Desenvolvido por Diego Bueno</p>
            </CardFooter>
          </Card>

          {API_CONFIG.GENERAL.DEBUG && (
            <div className="mt-4 rounded-lg border border-slate-300 bg-white/90 p-4 text-xs text-slate-600 dark:border-slate-600/70 dark:bg-slate-900/70 dark:text-slate-300">
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
