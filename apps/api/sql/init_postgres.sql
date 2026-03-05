-- Banco recomendado para produção: PostgreSQL
-- Este script cria a tabela principal de solicitações de viagem.

CREATE TABLE IF NOT EXISTS travel_requests (
  request_id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE NOT NULL,
  requester TEXT NOT NULL,
  tipo_solicitacao TEXT NOT NULL,
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  km_estimado NUMERIC(12,2) NOT NULL DEFAULT 0,
  centro_custo TEXT NULL,
  total_value NUMERIC(14,2) NOT NULL,
  numero_rm TEXT NULL,
  integration_status TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT NULL,
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  rateio JSONB NOT NULL DEFAULT '[]'::jsonb,
  anexos JSONB NOT NULL DEFAULT '[]'::jsonb,
  observacao TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  integrated_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_travel_requests_created_at ON travel_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_travel_requests_status ON travel_requests (integration_status);
CREATE INDEX IF NOT EXISTS idx_travel_requests_requester ON travel_requests (requester);

CREATE TABLE IF NOT EXISTS app_users (
  username TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  email TEXT NULL,
  rm_user_id TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ NULL,
  raw_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users (email);
CREATE INDEX IF NOT EXISTS idx_app_users_rm_user_id ON app_users (rm_user_id);

CREATE TABLE IF NOT EXISTS google_api_keys (
  id BIGSERIAL PRIMARY KEY,
  key_name TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL,
  project_id TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_rotated_at TIMESTAMPTZ NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_google_api_keys_active ON google_api_keys (is_active);
