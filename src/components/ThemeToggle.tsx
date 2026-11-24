'use client';

import type { Theme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  mounted: boolean;
}

export default function ThemeToggle({ theme, onToggle, mounted }: ThemeToggleProps) {
  if (!mounted) {
    return (
      <div className="w-20 h-9 rounded-md bg-slate-800/40 animate-pulse border border-slate-700/50" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      title={isDark ? 'Ganti ke tema terang (Light Mode)' : 'Ganti ke tema gelap (Dark Mode)'}
      className={`min-h-[40px] sm:min-h-[36px] px-3 py-1.5 rounded-md font-mono text-xs font-medium border flex items-center gap-2 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isDark
          ? 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-800 hover:border-slate-700'
          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400 shadow-xs'
      }`}
    >
      {/* Clean SVG icon without emoji */}
      {isDark ? (
        // Moon Icon
        <svg
          className="w-3.5 h-3.5 text-amber-300 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // Sun Icon
        <svg
          className="w-3.5 h-3.5 text-amber-500 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
      <span className="tracking-tight uppercase font-semibold text-[11px]">
        {isDark ? 'GELAP' : 'TERANG'}
      </span>
    </button>
  );
}
