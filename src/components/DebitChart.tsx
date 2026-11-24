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
} from 'chart.js';
import type { Reading } from '@/lib/types';
import type { Theme } from '@/hooks/useTheme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DebitChartProps {
  readings: Reading[];
  theme?: Theme;
}

export default function DebitChart({ readings, theme = 'dark' }: DebitChartProps) {
  const isDark = theme === 'dark';

  const chartData = useMemo(() => {
    const labels = readings.map((r) => {
      const parts = r.DateTime.split(' ');
      return parts[1] || r.DateTime;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Debit Air (L/min)',
          data: readings.map((r) => r.Debit ?? 0),
          borderColor: isDark ? '#38bdf8' : '#0284c7',
          backgroundColor: isDark ? '#38bdf815' : '#0284c710',
          borderWidth: 1.75,
          pointRadius: readings.length > 20 ? 0 : 2.5,
          tension: 0.15,
          yAxisID: 'y',
        },
        {
          label: 'Total Akumulasi Debit (L)',
          data: readings.map((r) => r.TotalDebit ?? 0),
          borderColor: isDark ? '#c084fc' : '#7c3aed',
          backgroundColor: isDark ? '#c084fc15' : '#7c3aed10',
          borderWidth: 1.75,
          pointRadius: readings.length > 20 ? 0 : 2.5,
          tension: 0.15,
          yAxisID: 'y1',
        },
      ],
    };
  }, [readings, isDark]);

  const latest = readings[readings.length - 1];

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: isDark ? '#94a3b8' : '#475569',
            usePointStyle: true,
            pointStyle: 'circle' as const,
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
          type: 'linear' as const,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Debit (L/min)',
            color: isDark ? '#38bdf8' : '#0284c7',
            font: { size: 9, family: 'monospace' },
          },
          ticks: { color: '#64748b', font: { size: 9, family: 'monospace' } },
          grid: {
            color: isDark ? '#33415535' : '#e2e8f0',
            lineWidth: 0.5,
          },
        },
        y1: {
          type: 'linear' as const,
          position: 'right' as const,
          title: {
            display: true,
            text: 'Total (L)',
            color: isDark ? '#c084fc' : '#7c3aed',
            font: { size: 9, family: 'monospace' },
          },
          ticks: { color: '#64748b', font: { size: 9, family: 'monospace' } },
          grid: { drawOnChartArea: false },
        },
      },
    }),
    [isDark]
  );

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 shadow-xs dark:shadow-none transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <h3 className="font-semibold text-xs sm:text-sm font-mono tracking-tight uppercase text-slate-900 dark:text-slate-100">
          Laju Aliran Irigasi & Akumulasi Volume
        </h3>
        {latest && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/80">
              Debit: {latest.Debit !== undefined ? latest.Debit.toFixed(1) : '0.0'} L/min
            </span>
            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80">
              Total: {latest.TotalDebit !== undefined ? latest.TotalDebit.toFixed(1) : '0.0'} L
            </span>
          </div>
        )}
      </div>

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
