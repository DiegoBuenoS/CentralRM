import { useEffect, useState } from 'react';

const THEME_KEY = 'theme';

const getInitialTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

export const useTheme = () => {
  const [theme, setTheme] = useState(() => getInitialTheme());
  const [isSystem, setIsSystem] = useState(() => localStorage.getItem(THEME_KEY) === null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (isSystem) {
      localStorage.removeItem(THEME_KEY);
    } else {
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme, isSystem]);

  useEffect(() => {
    if (!isSystem) return;

    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return undefined;

    const handleChange = (event) => {
      setTheme(event.matches ? 'dark' : 'light');
    };

    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
    } else if (media.addListener) {
      media.addListener(handleChange);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handleChange);
      } else if (media.removeListener) {
        media.removeListener(handleChange);
      }
    };
  }, [isSystem]);

  const toggleTheme = () => {
    setIsSystem(false);
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return {
    theme,
    isDarkMode: theme === 'dark',
    setTheme,
    toggleTheme,
  };
};
