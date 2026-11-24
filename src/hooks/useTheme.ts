'use client';

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const isHtmlDark = document.documentElement.classList.contains('dark');
      const saved = localStorage.getItem('theme-preference') as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
        if (saved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        const current: Theme = isHtmlDark ? 'dark' : 'light';
        setTheme(current);
      }
    } catch {
      setTheme('dark');
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme-preference', next);
    } catch {
      // Ignore in private browsing
    }
  };

  return { theme, toggleTheme, mounted };
}
