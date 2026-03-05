// App

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services';
import './index.css';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const TRAVEL_FOCUS_PATH = '/despesas-viagens';
const TRAVEL_FOCUS_PAGE = 'despesas-viagens';
const SETTINGS_USERS_PATH = '/configuracoes/usuarios';
const SETTINGS_USERS_PAGE = 'configuracoes-usuarios';
const SETTINGS_API_KEYS_PATH = '/configuracoes/chaves-api';
const SETTINGS_API_KEYS_PAGE = 'configuracoes-chaves-api';
const TEMP_DISABLED_MODULE_PATHS = [
  '/dashboard',
  '/tarefas',
  '/pedidos',
  '/notas-fiscais',
  '/relatorios',
  '/cadastros',
  '/cadastros/estoque',
  '/cadastros/estoque/produtos',
  '/cadastros/estoque/local',
  '/cadastros/financeiro',
  '/cadastros/financeiro/clientes',
  '/cadastros/financeiro/contas',
  '/cadastros/est-compras-fat',
  '/cadastros/globais',
];

// Auth guard
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

// Public guard
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to={TRAVEL_FOCUS_PATH} replace />;
};

const TravelFocusRoute = () => (
  <ProtectedRoute>
    <DashboardPage initialPage={TRAVEL_FOCUS_PAGE} />
  </ProtectedRoute>
);

const SettingsUsersRoute = () => (
  <ProtectedRoute>
    <DashboardPage initialPage={SETTINGS_USERS_PAGE} />
  </ProtectedRoute>
);

const SettingsApiKeysRoute = () => (
  <ProtectedRoute>
    <DashboardPage initialPage={SETTINGS_API_KEYS_PAGE} />
  </ProtectedRoute>
);

const TravelFocusRedirectRoute = () => (
  <ProtectedRoute>
    <Navigate to={TRAVEL_FOCUS_PATH} replace />
  </ProtectedRoute>
);

function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-mist text-sm text-graphite-600">
          Carregando...
        </div>
      }
    >
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path={TRAVEL_FOCUS_PATH}
          element={<TravelFocusRoute />}
        />
        <Route
          path={SETTINGS_USERS_PATH}
          element={<SettingsUsersRoute />}
        />
        <Route
          path={SETTINGS_API_KEYS_PATH}
          element={<SettingsApiKeysRoute />}
        />
        <Route
          path="/configuracoes"
          element={<Navigate to={SETTINGS_USERS_PATH} replace />}
        />

        {TEMP_DISABLED_MODULE_PATHS.map((path) => (
          <Route
            key={path}
            path={path}
            element={<TravelFocusRedirectRoute />}
          />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
