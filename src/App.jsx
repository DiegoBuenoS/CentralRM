// App

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { isAuthenticated } from './services';
import './index.css';

// Auth guard
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

// Public guard
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/tarefas" replace />;
};

function App() {
  return (
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
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tarefas"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="tarefas" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pedidos"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="pedidos" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notas-fiscais"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="notas-fiscais" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="relatorios" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="configuracoes" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cadastros"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="cadastros" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cadastros/estoque"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="cadastros-estoque" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cadastros/estoque/produtos"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="cadastros-estoque-produtos" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cadastros/estoque/local"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="cadastros-estoque-local" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cadastros/financeiro"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="cadastros-financeiro" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cadastros/financeiro/clientes"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="cadastros-financeiro-clientes" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cadastros/financeiro/contas"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="cadastros-financeiro-contas" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cadastros/est-compras-fat"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="cadastros-est-compras-fat" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cadastros/globais"
        element={
          <ProtectedRoute>
            <DashboardPage initialPage="cadastros-globais" />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
