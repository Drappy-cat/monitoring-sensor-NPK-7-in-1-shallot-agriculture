'use client';

import type { Reading } from '@/lib/types';

interface StatusCardsProps {
  reading: Reading | null;
  currentLoop?: number | null;
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
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-800/80',
    danger: 'bg-rose-950/60 text-rose-300 border-rose-800/80',
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
      <div>
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium">
            {label}
          </span>
          {badge && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                badgeStyles[badge.variant]
              }`}
            >
              {badge.text}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-mono font-semibold text-slate-100 tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-slate-400 font-normal">
              {unit}
            </span>
          )}
        </div>
      </div>
      {caption && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono truncate">
          {caption}
        </div>
      )}
    </div>
  );
}

export default function StatusCards({
  reading,
  currentLoop,
  currentCount,
  lastValveToggleTime,
}: StatusCardsProps) {
  if (!reading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3.5 h-24 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const isValveOpen = reading.ValveStatus === 'OPEN';
  const loopVal = currentLoop ?? reading.Looping ?? 1;
  const countVal = currentCount ?? reading.Count ?? 0;
  const toggleTimeDisplay = lastValveToggleTime || reading.DateTime || 'N/A';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Soil Moisture (Rata-rata 4 Sensor) */}
      <MetricCard
        label="Rata Kelembaban"
        value={reading.AvgMoisture !== undefined ? reading.AvgMoisture.toFixed(1) : 'N/A'}
        unit="%"
        caption="Rata-rata 4 titik sensor"
        badge={{
          text: 'SOIL MOISTURE',
          variant: 'neutral',
        }}
      />

      {/* 2. Looping Keberapa */}
      <MetricCard
        label="Looping Ke"
        value={loopVal}
        caption={`Siklus count: ${countVal}`}
        badge={{
          text: `LOOP #${loopVal}`,
          variant: 'neutral',
        }}
      />

      {/* 3. Status Katup Buka / Tutup */}
      <MetricCard
        label="Katup Irigasi"
        value={reading.ValveStatus || 'CLOSED'}
        caption={`Waktu: ${toggleTimeDisplay.split(' ')[1] || toggleTimeDisplay}`}
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
        caption="Laju aliran air saat ini"
      />

      {/* 5. Total Akumulasi Debit */}
      <MetricCard
        label="Total Debit"
        value={reading.TotalDebit !== undefined ? reading.TotalDebit.toFixed(1) : 'N/A'}
        unit="L"
        caption="Volume kumulatif irigasi"
      />

      {/* 6. Status Batas Maksimum */}
      <MetricCard
        label="Batas Maksimum"
        value={reading.MaxLimitReached ? 'TERCAPAI' : 'NORMAL'}
        caption={reading.MaxLimitReached ? 'Ambang batas aktif' : 'Dalam batas normal'}
        badge={{
          text: reading.MaxLimitReached ? 'ALERT' : 'OK',
          variant: reading.MaxLimitReached ? 'warning' : 'success',
        }}
      />
    </div>
  );
}
