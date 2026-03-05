import { getApiBaseUrl } from '../config/api';

export const uploadTravelAttachments = async ({ token, files }) => {
  if (!token) {
    throw new Error('Sessao invalida para upload.');
  }

  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const formData = new FormData();

  files.forEach((file, index) => {
    const uri = file?.uri || '';
    if (!uri) return;

    formData.append('files', {
      uri,
      name: file?.name || `comprovante-${index + 1}.jpg`,
      type: file?.type || 'application/octet-stream',
    });
  });

  const response = await fetch(`${getApiBaseUrl()}/api/uploads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || 'Falha ao enviar comprovantes.');
  }

  return payload?.files || [];
};
