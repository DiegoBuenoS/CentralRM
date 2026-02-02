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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
