export const APP_NAME = 'RM Despesas';

export const APP_PLATFORMS = {
  WEB: 'web',
  MOBILE: 'mobile',
};

export const TRAVEL_ROUTES = {
  LOGIN: '/',
  TRAVEL_EXPENSES: '/despesas-viagens',
};

export const TRAVEL_STATUS = {
  APPROVED: 'Aprovada',
  FINISHED: 'Finalizada',
  PAYMENT_QUEUE: 'Em fila de pagamento',
  WAITING_INTEGRATION: 'Aguardando integração',
  IN_PROGRESS: 'Viagem em andamento',
};

export const currencyToBRL = (value) => {
  const amount = Number(value || 0);
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
};

export const buildBackendBaseUrl = (rawUrl) => {
  const fallback = 'http://localhost:8787';
  const value = (rawUrl || '').trim();
  return value || fallback;
};
