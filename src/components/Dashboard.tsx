'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { useTheme } from '@/hooks/useTheme';
import LiveIndicator from './LiveIndicator';
import ThemeToggle from './ThemeToggle';
import StatusCards from './StatusCards';
import ValveLoopingPanel from './ValveLoopingPanel';
import SensorChart from './SensorChart';
import DebitChart from './DebitChart';
import SensorTable from './SensorTable';
import IntervalSelector from './IntervalSelector';
import { PARAM_LABELS, type TimeInterval } from '@/lib/types';

export default function Dashboard() {
  const { theme, toggleTheme, mounted } = useTheme();
  const [globalInterval, setGlobalInterval] = useState<TimeInterval>('second');

  const {
    readings,
    minuteReadings,
    hourlyReadings,
    dailyReadings,
    isLoadingHistory,
    latestReading,
    isConnected,
    error,
    activeDate,
    currentLoop,
    totalCycles,
    currentCount,
    lastValveToggleTime,
    lastValveOpenTime,
    lastValveCloseTime,
    valveEvents,
  } = useFirebaseData(60);

  const remoteSeries = useMemo(
    () => ({
      minute: minuteReadings,
      hour: hourlyReadings,
      day: dailyReadings,
    }),
    [minuteReadings, hourlyReadings, dailyReadings]
  );

  const formattedDetailTime = latestReading?.DateTime
    ? `${latestReading.DateTime} WIB`
    : 'Menghubungkan...';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-250">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-none transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-xs inline-block shrink-0" />
              <h1 className="text-xs sm:text-sm md:text-base font-bold font-mono tracking-tight uppercase text-slate-900 dark:text-slate-100">
                Sistem Telemetri Sensor NPK 7-in-1: Bawang Merah
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs font-mono mt-0.5">
              4 Titik Sensor RS485 Modbus RTU / Firebase RTDB Realtime
            </p>
          </div>

          {/* Action pills & theme toggle */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start sm:self-auto">
            {/* Camera page link */}
            <Link
              href="/camera"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-mono font-semibold border bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/60 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9.75a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              KAMERA
            </Link>

            <LiveIndicator isConnected={isConnected} />

            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400">WAKTU:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formattedDetailTime}</span>
            </div>

            {/* Dark & Light mode toggle with smooth transition */}
            <ThemeToggle theme={theme} onToggle={toggleTheme} mounted={mounted} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-md px-3.5 py-2 text-rose-800 dark:text-rose-300 text-xs font-mono">
            Koneksi Database Error: {error}
          </div>
        )}

        {/* 1. Status Cards Telemetri */}
        <section aria-label="Ringkasan Metrik Telemetri">
          <StatusCards
            reading={latestReading}
            currentLoop={currentLoop}
            totalCycles={totalCycles}
            currentCount={currentCount}
            lastValveToggleTime={lastValveToggleTime}
          />
        </section>

        {/* 2. Aktuator Katup & Looping Irigasi */}
        <section aria-label="Kontrol Katup dan Looping">
          <ValveLoopingPanel
            reading={latestReading}
            currentLoop={currentLoop}
            totalCycles={totalCycles}
            currentCount={currentCount}
            lastValveToggleTime={lastValveToggleTime}
            lastValveOpenTime={lastValveOpenTime}
            lastValveCloseTime={lastValveCloseTime}
            valveEvents={valveEvents}
          />
        </section>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs font-mono px-0.5 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
            <span>Aliran Realtime: {readings.length} titik telemetri</span>
          </div>
          {activeDate && <span>Tanggal: {activeDate}</span>}
        </div>

        {/* Master Timeframe Selector Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-sky-400 inline-block shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-tight text-slate-900 dark:text-slate-100">
                Pilihan Rentang Waktu Tampilan Data
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              100% Data Langsung Firebase RTDB: per Detik (realtime), Menit (30m), Jam (mulai 25 Nov 00:00 WIB), atau Hari (mulai 25 Nov 00:00 WIB)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {isLoadingHistory && (
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 animate-pulse">
                Sinkronisasi Firebase...
              </span>
            )}
            <IntervalSelector value={globalInterval} onChange={setGlobalInterval} size="md" />
          </div>
        </div>

        {/* 3. SOIL MOISTURE (PRIORITAS UTAMA / REGISTER 00 01) */}
        <section className="space-y-2" aria-label="Parameter Soil Moisture">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-slate-200 uppercase tracking-tight">
                Soil Moisture (Kelembaban Tanah) - Parameter Utama
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Register 00 01: Kelembaban per titik sensor dan garis rata-rata 4 sensor
              </p>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
              PRIORITAS UTAMA
            </span>
          </div>

          <SensorChart
            title={PARAM_LABELS.Moisture}
            parameter="Moisture"
            readings={readings}
            latestReading={latestReading}
            remoteSeries={remoteSeries}
            showAvgMoisture={true}
            highlighted={true}
            theme={theme}
            interval={globalInterval}
            onIntervalChange={setGlobalInterval}
          />
        </section>

        {/* 4. PARAMETER FISIK: Temperature (00 00) & Conductivity (00 02) */}
        <section className="space-y-2.5" aria-label="Parameter Fisik Tanah">
          <div>
            <h2 className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-slate-200 uppercase tracking-tight">
              Karakteristik Fisik Tanah: Suhu & Konduktivitas Listrik
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Register 00 00 (Temperature) dan Register 00 02 (Conductivity / EC)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
            <SensorChart
              title={PARAM_LABELS.Temperature}
              parameter="Temperature"
              readings={readings}
              latestReading={latestReading}
              remoteSeries={remoteSeries}
              theme={theme}
              interval={globalInterval}
              onIntervalChange={setGlobalInterval}
            />
            <SensorChart
              title={PARAM_LABELS.Conductivity}
              parameter="Conductivity"
              readings={readings}
              latestReading={latestReading}
              remoteSeries={remoteSeries}
              theme={theme}
              interval={globalInterval}
              onIntervalChange={setGlobalInterval}
            />
          </div>
        </section>

        {/* 5. PARAMETER KIMIA & NUTRISI: pH (00 03), N (00 04), P (00 05), K (00 06) */}
        <section className="space-y-2.5" aria-label="Parameter Kimia dan Nutrisi Tanah">
          <div>
            <h2 className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-slate-200 uppercase tracking-tight">
              Karakteristik Kimia & Nutrisi NPK Tanah
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Register 00 03 (pH) dan Register 00 04 - 00 06 (Nitrogen, Phosphorus, Potassium)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
            <SensorChart
              title={PARAM_LABELS.PH}
              parameter="PH"
              readings={readings}
              latestReading={latestReading}
              remoteSeries={remoteSeries}
              theme={theme}
              interval={globalInterval}
              onIntervalChange={setGlobalInterval}
            />
            <SensorChart
              title={PARAM_LABELS.N}
              parameter="N"
              readings={readings}
              latestReading={latestReading}
              remoteSeries={remoteSeries}
              theme={theme}
              interval={globalInterval}
              onIntervalChange={setGlobalInterval}
            />
            <SensorChart
              title={PARAM_LABELS.P}
              parameter="P"
              readings={readings}
              latestReading={latestReading}
              remoteSeries={remoteSeries}
              theme={theme}
              interval={globalInterval}
              onIntervalChange={setGlobalInterval}
            />
            <SensorChart
              title={PARAM_LABELS.K}
              parameter="K"
              readings={readings}
              latestReading={latestReading}
              remoteSeries={remoteSeries}
              theme={theme}
              interval={globalInterval}
              onIntervalChange={setGlobalInterval}
            />
          </div>
        </section>

        {/* 6. IRIGASI & DEBIT AIR */}
        <section className="space-y-2" aria-label="Parameter Aliran Irigasi">
          <div>
            <h2 className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-slate-200 uppercase tracking-tight">
              Laju Aliran Irigasi & Volume Kumulatif
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Monitoring debit air saat ini (L/min) dan total akumulasi volume air (L)
            </p>
          </div>
          <DebitChart
            readings={readings}
            latestReading={latestReading}
            remoteSeries={remoteSeries}
            theme={theme}
            interval={globalInterval}
            onIntervalChange={setGlobalInterval}
          />
        </section>

        {/* 7. MATRIKS KOMPARASI TITIK SENSOR (Mobile Sticky Column) */}
        <section aria-label="Tabel Komparasi Sensor">
          <SensorTable reading={latestReading} />
        </section>

        {/* Footer */}
        <footer className="text-center text-slate-500 dark:text-slate-500 font-mono text-[11px] sm:text-xs py-4 sm:py-5 border-t border-slate-200 dark:border-slate-800">
          ESP32 + RS485 NPK 7-in-1 Sensor Suite • Modbus RTU Protocol • Realtime Telemetry System
        </footer>
      </main>
    </div>
  );
}
