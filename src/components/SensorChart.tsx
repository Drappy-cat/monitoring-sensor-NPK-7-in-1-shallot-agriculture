'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { Reading, SensorKey, SensorParam } from '@/lib/types';
import type { Theme } from '@/hooks/useTheme';
import { SENSOR_KEYS, SENSOR_LABELS, SENSOR_COLORS, PARAM_UNITS, PARAM_REGISTERS } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SensorChartProps {
  title: string;
  parameter: SensorParam;
  readings: Reading[];
  showAvgMoisture?: boolean;
  highlighted?: boolean;
  theme?: Theme;
}

export default function SensorChart({
  title,
  parameter,
  readings,
  showAvgMoisture = false,
  highlighted = false,
  theme = 'dark',
}: SensorChartProps) {
  const isDark = theme === 'dark';

  const chartData = useMemo(() => {
    const labels = readings.map((r) => {
      const parts = r.DateTime.split(' ');
      return parts[1] || r.DateTime;
    });

    const datasets = SENSOR_KEYS.map((sensorKey: SensorKey) => ({
      label: SENSOR_LABELS[sensorKey],
      data: readings.map((r) => r[sensorKey]?.[parameter] ?? null),
      borderColor: SENSOR_COLORS[sensorKey],
      backgroundColor: SENSOR_COLORS[sensorKey] + (isDark ? '15' : '10'),
      borderWidth: 1.75,
      pointRadius: readings.length > 20 ? 0 : 2.5,
      pointHoverRadius: 4,
      tension: 0.15,
      fill: false,
    }));

    if (showAvgMoisture) {
      datasets.unshift({
        label: 'Rata-rata 4 Sensor',
        data: readings.map((r) => r.AvgMoisture ?? null),
        borderColor: isDark ? '#c084fc' : '#9333ea',
        backgroundColor: isDark ? '#c084fc20' : '#9333ea15',
        borderWidth: 2.5,
        pointRadius: readings.length > 20 ? 0 : 3.5,
        pointHoverRadius: 5,
        tension: 0.15,
        fill: false,
      });
    }

    return { labels, datasets };
  }, [readings, parameter, showAvgMoisture, isDark]);

  const unit = PARAM_UNITS[parameter];
  const registerLoc = PARAM_REGISTERS[parameter];
  const latest = readings[readings.length - 1];

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0, // Realtime telemetry zero-latency rendering
      },
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: isDark ? '#94a3b8' : '#475569',
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 10,
            font: { size: 10, family: 'monospace' },
            boxWidth: 8,
          },
        },
        tooltip: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          titleColor: isDark ? '#f1f5f9' : '#0f172a',
          bodyColor: isDark ? '#cbd5e1' : '#334155',
          borderColor: isDark ? '#334155' : '#cbd5e1',
          borderWidth: 1,
          padding: 8,
          titleFont: { family: 'monospace', size: 11 },
          bodyFont: { family: 'monospace', size: 11 },
          callbacks: {
            label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => {
              const v = ctx.parsed.y;
              if (v === null) return '';
              return `${ctx.dataset.label}: ${v}${unit ? ' ' + unit : ''}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#64748b',
            maxRotation: 0,
            font: { size: 9, family: 'monospace' },
            maxTicksLimit: 6,
          },
          grid: {
            color: isDark ? '#33415525' : '#e2e8f0',
            lineWidth: 0.5,
          },
        },
        y: {
          ticks: {
            color: '#64748b',
            font: { size: 9, family: 'monospace' },
            callback: (value: string | number) => `${value}${unit ? ' ' + unit : ''}`,
          },
          grid: {
            color: isDark ? '#33415535' : '#e2e8f0',
            lineWidth: 0.5,
          },
        },
      },
    }),
    [unit, isDark]
  );

  return (
    <div
      className={`rounded-lg p-3 sm:p-4 transition-colors ${
        highlighted
          ? isDark
            ? 'bg-slate-900/80 border-2 border-blue-600/70'
            : 'bg-white border-2 border-blue-500 shadow-xs'
          : isDark
          ? 'bg-slate-900/50 border border-slate-800'
          : 'bg-white border border-slate-200 shadow-xs'
      }`}
    >
      {/* Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h3 className="font-semibold text-xs sm:text-sm font-mono tracking-tight uppercase text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          {registerLoc && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              REG {registerLoc}
            </span>
          )}
        </div>

        {/* Live current reading values */}
        {latest && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] font-mono">
            {showAvgMoisture && latest.AvgMoisture !== undefined && (
              <span className="px-1.5 py-0.5 rounded font-medium bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80">
                Rata: {latest.AvgMoisture.toFixed(1)}%
              </span>
            )}
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
              S1: {latest.sensor_1?.[parameter] ?? '-'} | S2: {latest.sensor_2?.[parameter] ?? '-'} | S3: {latest.sensor_3?.[parameter] ?? '-'} | S4: {latest.sensor_4?.[parameter] ?? '-'} {unit}
            </span>
          </div>
        )}
      </div>

      {/* Chart Canvas with mobile responsive height */}
      <div className="h-[210px] sm:h-[240px] md:h-[270px]">
        {readings.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 font-mono text-xs">
            Menunggu data telemetri...
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
