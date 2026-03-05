# Persistencia de Solicitacoes de Viagem

## Tabela ERP (SQL Server)

- Script: `apps/api/sql/erp_travel_requests.sql`
- Cria a tabela `dbo.RM_DESPESAS_VIAGENS` com:
  - status de integracao (`PENDENTE`, `ENVIADO`, `ERRO`, `INTEGRADO`)
  - idempotencia (`IDEMPOTENCY_KEY` unico)
  - payload completo em JSON para auditoria
  - indices para fila de integracao e consultas operacionais

## Endpoints backend

- `POST /api/travel-requests` cria solicitacao
- `GET /api/travel-requests` lista com filtros (`integrationStatus`, `requester`, `q`, `limit`, `offset`)
- `GET /api/travel-requests/queue` fila de integracao (`PENDENTE` e `ERRO`)
- `GET /api/travel-requests/:requestId` busca detalhada
- `PATCH /api/travel-requests/:requestId/integration` atualiza status de integracao

## Armazenamento atual do backend

- Arquivo local configurado por `TRAVEL_REQUESTS_FILE`.
- Objetivo: garantir persistencia imediata no backend enquanto a tabela ERP e o fluxo final sao homologados.
