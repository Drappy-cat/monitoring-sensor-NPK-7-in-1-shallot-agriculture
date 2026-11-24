'use client';

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme-preference') as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
        document.documentElement.classList.toggle('dark', saved === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial: Theme = prefersDark ? 'dark' : 'light';
        setTheme(initial);
        document.documentElement.classList.toggle('dark', initial === 'dark');
      }
    } catch {
      // Fallback for SSR or restricted environments
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('theme-preference', next);
    } catch {
      // Ignore localStorage write failures in private browsing
    }
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return { theme, toggleTheme, mounted };
}
