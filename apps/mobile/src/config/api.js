import { Platform } from 'react-native';

const defaultByPlatform = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8787';
  }
  return 'http://localhost:8787';
};

export const getApiBaseUrl = () => {
  const fromEnv =
    typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_API_BASE_URL
      ? String(process.env.EXPO_PUBLIC_API_BASE_URL).trim()
      : '';

  return fromEnv || defaultByPlatform();
};
