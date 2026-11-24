'use client';

import type { Reading, SensorKey, SensorParam } from '@/lib/types';
import {
  SENSOR_KEYS,
  SENSOR_LABELS,
  SENSOR_COLORS,
  ORDERED_PARAMS,
  PARAM_UNITS,
  PARAM_REGISTERS,
} from '@/lib/types';

interface SensorTableProps {
  reading: Reading | null;
}

const PARAM_SHORT_NAMES: Record<SensorParam, string> = {
  Moisture: 'Moisture',
  Temperature: 'Temp',
  Conductivity: 'EC (Cond)',
  PH: 'pH',
  N: 'N',
  P: 'P',
  K: 'K',
};

export default function SensorTable({ reading }: SensorTableProps) {
  if (!reading) {
    return (
      <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-4 animate-pulse h-40" />
    );
  }

  // Find min/max per param for highlighting
  const extremes: Record<string, { min: number; max: number; minSensor: string; maxSensor: string }> = {};
  for (const param of ORDERED_PARAMS) {
    let min = Infinity;
    let max = -Infinity;
    let minSensor = '';
    let maxSensor = '';
    for (const sk of SENSOR_KEYS) {
      const val = reading[sk]?.[param];
      if (val !== undefined) {
        if (val < min) { min = val; minSensor = sk; }
        if (val > max) { max = val; maxSensor = sk; }
      }
    }
    extremes[param] = { min, max, minSensor, maxSensor };
  }

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 sm:p-4 space-y-3 shadow-xs dark:shadow-none transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-semibold text-xs sm:text-sm font-mono tracking-tight uppercase text-slate-900 dark:text-slate-100">
            Matriks Pembacaan 4 Titik Sensor
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Geser tabel ke samping untuk melihat seluruh parameter Modbus (Reg 00 00 - 00 06)
          </p>
        </div>
        <div className="flex gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 self-start sm:self-auto">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" /> Max
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-rose-500 inline-block" /> Min
          </span>
        </div>
      </div>

      {/* Responsive table with sticky left column for mobile */}
      <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-800">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
              {/* Sticky first column on mobile */}
              <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 text-left text-slate-700 dark:text-slate-300 font-semibold py-2.5 px-3 whitespace-nowrap shadow-xs sm:shadow-none">
                Titik Sensor
              </th>
              {ORDERED_PARAMS.map((p) => {
                const isMoisture = p === 'Moisture';
                return (
                  <th
                    key={p}
                    className={`text-right py-2.5 px-2.5 font-semibold whitespace-nowrap ${
                      isMoisture
                        ? 'text-blue-800 dark:text-sky-300 bg-blue-50 dark:bg-sky-950/20'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{PARAM_SHORT_NAMES[p]}</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                        {PARAM_REGISTERS[p]}
                      </span>
                    </div>
                    {PARAM_UNITS[p] && (
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 font-normal">
                        {PARAM_UNITS[p]}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {SENSOR_KEYS.map((sk: SensorKey) => (
              <tr key={sk} className="hover:bg-slate-50 dark:hover:bg-slate-800/25 transition-colors">
                {/* Pinned left column */}
                <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 py-2.5 px-3 whitespace-nowrap shadow-xs sm:shadow-none border-r border-slate-200 dark:border-slate-800 sm:border-r-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: SENSOR_COLORS[sk] }}
                    />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {SENSOR_LABELS[sk]}
                    </span>
                  </div>
                </td>
                {ORDERED_PARAMS.map((param) => {
                  const val = reading[sk]?.[param];
                  const isMax = extremes[param].maxSensor === sk && extremes[param].max !== extremes[param].min;
                  const isMin = extremes[param].minSensor === sk && extremes[param].max !== extremes[param].min;
                  const isMoisture = param === 'Moisture';

                  return (
                    <td
                      key={param}
                      className={`text-right py-2.5 px-2.5 whitespace-nowrap ${
                        isMoisture ? 'bg-blue-50/50 dark:bg-sky-950/10' : ''
                      } ${
                        isMax
                          ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20'
                          : isMin
                          ? 'text-rose-700 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/20'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {val !== undefined ? val : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
