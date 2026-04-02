import { useEffect } from 'react';

const THEME_KEY = 'theme';

export const useTheme = () => {
  const theme = 'light';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem(THEME_KEY, 'light');
  }, []);

  const toggleTheme = () => {};
  const setTheme = () => {};

  return {
    theme,
    isDarkMode: false,
    setTheme,
    toggleTheme,
  };
};
