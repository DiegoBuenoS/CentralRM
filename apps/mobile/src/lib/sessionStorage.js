import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@central-rm/session_token';
const USER_KEY = '@central-rm/user_data';

export const saveSession = async ({ token, user }) => {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token || ''],
    [USER_KEY, JSON.stringify(user || {})],
  ]);
};

export const loadSession = async () => {
  const entries = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
  const token = entries.find(([key]) => key === TOKEN_KEY)?.[1] || '';
  const userRaw = entries.find(([key]) => key === USER_KEY)?.[1] || '{}';

  let user = {};
  try {
    user = JSON.parse(userRaw);
  } catch {
    user = {};
  }

  return {
    token,
    user,
  };
};

export const clearSession = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
};
