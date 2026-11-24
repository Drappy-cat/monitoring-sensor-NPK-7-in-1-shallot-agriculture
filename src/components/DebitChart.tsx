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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DebitChartProps {
  readings: Reading[];
}

export default function DebitChart({ readings }: DebitChartProps) {
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
          borderColor: '#0284c7',
          backgroundColor: '#0284c715',
          borderWidth: 1.75,
          pointRadius: readings.length > 25 ? 0 : 2.5,
          tension: 0.15,
          yAxisID: 'y',
        },
        {
          label: 'Total Akumulasi Debit (L)',
          data: readings.map((r) => r.TotalDebit ?? 0),
          borderColor: '#7c3aed',
          backgroundColor: '#7c3aed15',
          borderWidth: 1.75,
          pointRadius: readings.length > 25 ? 0 : 2.5,
          tension: 0.15,
          yAxisID: 'y1',
        },
      ],
    };
  }, [readings]);

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
          labels: { color: '#94a3b8', usePointStyle: true, pointStyle: 'circle' as const, padding: 12, font: { size: 11, family: 'monospace' } },
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f1f5f9',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 8,
          titleFont: { family: 'monospace', size: 11 },
          bodyFont: { family: 'monospace', size: 11 },
        },
      },
      scales: {
        x: {
          ticks: { color: '#64748b', maxRotation: 0, font: { size: 10, family: 'monospace' }, maxTicksLimit: 8 },
          grid: { color: '#33415520', lineWidth: 0.5 },
        },
        y: {
          type: 'linear' as const,
          position: 'left' as const,
          title: { display: true, text: 'Debit (L/min)', color: '#0284c7', font: { size: 10, family: 'monospace' } },
          ticks: { color: '#64748b', font: { size: 10, family: 'monospace' } },
          grid: { color: '#33415530', lineWidth: 0.5 },
        },
        y1: {
          type: 'linear' as const,
          position: 'right' as const,
          title: { display: true, text: 'Total (L)', color: '#7c3aed', font: { size: 10, family: 'monospace' } },
          ticks: { color: '#64748b', font: { size: 10, family: 'monospace' } },
          grid: { drawOnChartArea: false },
        },
      },
    }),
    []
  );

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <h3 className="text-slate-100 font-semibold text-xs md:text-sm font-mono tracking-tight uppercase">
          Laju Aliran Irigasi & Akumulasi Volume
        </h3>
        {latest && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/80">
              Debit: {latest.Debit !== undefined ? latest.Debit.toFixed(1) : '0.0'} L/min
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/80">
              Total: {latest.TotalDebit !== undefined ? latest.TotalDebit.toFixed(1) : '0.0'} L
            </span>
          </div>
        )}
      </div>

      <div className="h-[270px]">
        {readings.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 font-mono text-xs">
            Menunggu data telemetri...
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
