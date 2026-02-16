import apiClient from './apiClient';

export const getTravelRouteEstimate = async ({
  origin,
  destination,
  roundTrip = false,
  includeTolls = false,
}) => {
  if (!origin || !destination) {
    throw new Error('Informe origem e destino para calcular a distância.');
  }

  try {
    const response = await apiClient.post('/api/maps/distance', {
      origin,
      destination,
      roundTrip,
      includeTolls,
    });
    const distanceKm = response?.data?.distanceKm;
    if (distanceKm === undefined || distanceKm === null) {
      throw new Error('Resposta inválida do backend.');
    }
    return {
      distanceKm: Number(distanceKm),
      tollAmount: response?.data?.tollAmount ?? null,
      tollCurrency: response?.data?.tollCurrency || null,
      roundTripApplied: Boolean(response?.data?.roundTripApplied),
    };
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || 'Não foi possível calcular a distância no momento.';
    throw new Error(message);
  }
};

export const getEstimatedDistanceKm = async ({ origin, destination }) => {
  const estimate = await getTravelRouteEstimate({ origin, destination });
  return estimate.distanceKm;
};
