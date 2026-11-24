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
}

export default function SensorChart({
  title,
  parameter,
  readings,
  showAvgMoisture = false,
  highlighted = false,
}: SensorChartProps) {
  const chartData = useMemo(() => {
    const labels = readings.map((r) => {
      const parts = r.DateTime.split(' ');
      return parts[1] || r.DateTime;
    });

    const datasets = SENSOR_KEYS.map((sensorKey: SensorKey) => ({
      label: SENSOR_LABELS[sensorKey],
      data: readings.map((r) => r[sensorKey]?.[parameter] ?? null),
      borderColor: SENSOR_COLORS[sensorKey],
      backgroundColor: SENSOR_COLORS[sensorKey] + '15',
      borderWidth: 1.75,
      pointRadius: readings.length > 25 ? 0 : 2.5,
      pointHoverRadius: 4,
      tension: 0.15,
      fill: false,
    }));

    if (showAvgMoisture) {
      datasets.unshift({
        label: 'Rata-rata 4 Sensor',
        data: readings.map((r) => r.AvgMoisture ?? null),
        borderColor: '#a855f7',
        backgroundColor: '#a855f720',
        borderWidth: 2.5,
        pointRadius: readings.length > 25 ? 0 : 3.5,
        pointHoverRadius: 5,
        tension: 0.15,
        fill: false,
      });
    }

    return { labels, datasets };
  }, [readings, parameter, showAvgMoisture]);

  const unit = PARAM_UNITS[parameter];
  const registerLoc = PARAM_REGISTERS[parameter];
  const latest = readings[readings.length - 1];

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0, // Real-time telemetry zero-latency rendering
      },
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: '#94a3b8',
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 12,
            font: { size: 11, family: 'monospace' },
          },
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
            font: { size: 10, family: 'monospace' },
            maxTicksLimit: 8,
          },
          grid: { color: '#33415520', lineWidth: 0.5 },
        },
        y: {
          ticks: {
            color: '#64748b',
            font: { size: 10, family: 'monospace' },
            callback: (value: string | number) => `${value}${unit ? ' ' + unit : ''}`,
          },
          grid: { color: '#33415530', lineWidth: 0.5 },
        },
      },
    }),
    [unit]
  );

  return (
    <div
      className={`rounded-lg p-4 transition-colors ${
        highlighted
          ? 'bg-slate-900/80 border-2 border-blue-600/60'
          : 'bg-slate-900/50 border border-slate-800'
      }`}
    >
      {/* Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <h3 className="text-slate-100 font-semibold text-xs md:text-sm font-mono tracking-tight uppercase">
            {title}
          </h3>
          {registerLoc && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              REG {registerLoc}
            </span>
          )}
        </div>

        {/* Live current reading values */}
        {latest && (
          <div className="flex items-center gap-2 text-xs font-mono">
            {showAvgMoisture && latest.AvgMoisture !== undefined && (
              <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/80 font-medium">
                Rata: {latest.AvgMoisture.toFixed(1)}%
              </span>
            )}
            <span className="text-slate-400 hidden sm:inline text-[11px]">
              S1: {latest.sensor_1?.[parameter] ?? '-'} | S2: {latest.sensor_2?.[parameter] ?? '-'} | S3: {latest.sensor_3?.[parameter] ?? '-'} | S4: {latest.sensor_4?.[parameter] ?? '-'} {unit}
            </span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
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
