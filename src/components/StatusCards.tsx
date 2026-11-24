'use client';

import type { Reading } from '@/lib/types';

interface StatusCardsProps {
  reading: Reading | null;
  currentLoop?: number;
  totalCycles?: number;
  currentCount?: number | null;
  lastValveToggleTime?: string | null;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  caption?: string;
  badge?: {
    text: string;
    variant: 'neutral' | 'success' | 'warning' | 'danger';
  };
}

function MetricCard({ label, value, unit, caption, badge }: MetricCardProps) {
  const badgeStyles = {
    neutral:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    success:
      'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
    warning:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
    danger:
      'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80',
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-3.5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 shadow-xs dark:shadow-none transition-colors">
      <div>
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
            {label}
          </span>
          {badge && (
            <span
              className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                badgeStyles[badge.variant]
              }`}
            >
              {badge.text}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-xl sm:text-2xl font-mono font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-normal">
              {unit}
            </span>
          )}
        </div>
      </div>
      {caption && (
        <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
          {caption}
        </div>
      )}
    </div>
  );
}

export default function StatusCards({
  reading,
  currentLoop = 1,
  totalCycles = 18,
  lastValveToggleTime,
}: StatusCardsProps) {
  if (!reading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-lg p-3 sm:p-3.5 h-22 sm:h-24 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const isValveOpen = reading.ValveStatus === 'OPEN';
  const toggleTimeDisplay = lastValveToggleTime || '2026-11-24 01:00:17';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
      {/* 1. Soil Moisture (Rata-rata 4 Sensor) */}
      <MetricCard
        label="Rata Kelembaban"
        value={reading.AvgMoisture !== undefined ? reading.AvgMoisture.toFixed(1) : 'N/A'}
        unit="%"
        caption="Rata 4 titik sensor"
        badge={{
          text: 'SOIL MOISTURE',
          variant: 'neutral',
        }}
      />

      {/* 2. Siklus Solenoid Valve */}
      <MetricCard
        label="Siklus Solenoid"
        value={`Siklus #${currentLoop}`}
        caption={`Total kalibrasi: ${totalCycles} siklus`}
        badge={{
          text: isValveOpen ? 'AKTIF' : 'SELESAI',
          variant: isValveOpen ? 'success' : 'neutral',
        }}
      />

      {/* 3. Status Katup Buka / Tutup */}
      <MetricCard
        label="Katup Solenoid"
        value={reading.ValveStatus || 'CLOSED'}
        caption={`Transisi: ${toggleTimeDisplay.split(' ')[1] || toggleTimeDisplay} WIB`}
        badge={{
          text: isValveOpen ? 'OPEN' : 'CLOSED',
          variant: isValveOpen ? 'success' : 'danger',
        }}
      />

      {/* 4. Debit Air Saat Ini */}
      <MetricCard
        label="Debit Air"
        value={reading.Debit !== undefined ? reading.Debit.toFixed(1) : '0.0'}
        unit="L/min"
        caption="Laju aliran air"
      />

      {/* 5. Total Akumulasi Debit */}
      <MetricCard
        label="Total Debit"
        value={reading.TotalDebit !== undefined ? reading.TotalDebit.toFixed(1) : 'N/A'}
        unit="L"
        caption="Volume kumulatif"
      />

      {/* 6. Status Batas Maksimum */}
      <MetricCard
        label="Batas Maksimum"
        value={reading.MaxLimitReached ? 'TERCAPAI' : 'NORMAL'}
        caption={reading.MaxLimitReached ? 'Ambang batas aktif' : 'Batas normal'}
        badge={{
          text: reading.MaxLimitReached ? 'ALERT' : 'OK',
          variant: reading.MaxLimitReached ? 'warning' : 'success',
        }}
      />
    </div>
  );
}
