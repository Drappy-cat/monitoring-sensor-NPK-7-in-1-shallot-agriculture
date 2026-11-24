'use client';

import type { TimeInterval } from '@/lib/types';
import { TIME_INTERVALS } from '@/lib/types';

interface IntervalSelectorProps {
  value: TimeInterval;
  onChange: (val: TimeInterval) => void;
  size?: 'sm' | 'md';
}

export default function IntervalSelector({
  value,
  onChange,
  size = 'sm',
}: IntervalSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Pilih Interval Waktu Data"
      className="inline-flex items-center gap-0.5 p-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 font-mono text-[10px] sm:text-[11px]"
    >
      {TIME_INTERVALS.map((intv) => {
        const isActive = value === intv.key;
        return (
          <button
            key={intv.key}
            type="button"
            title={intv.tooltip}
            onClick={() => onChange(intv.key)}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded font-medium transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 font-semibold shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {intv.label}
          </button>
        );
      })}
    </div>
  );
}
