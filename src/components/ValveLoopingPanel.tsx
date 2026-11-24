'use client';

import type { Reading, ValveEvent } from '@/lib/types';

interface ValveLoopingPanelProps {
  reading: Reading | null;
  currentLoop: number | null;
  currentCount: number | null;
  lastValveToggleTime: string | null;
  valveEvents: ValveEvent[];
}

export default function ValveLoopingPanel({
  reading,
  currentLoop,
  currentCount,
  lastValveToggleTime,
  valveEvents,
}: ValveLoopingPanelProps) {
  const isValveOpen = reading?.ValveStatus === 'OPEN';
  const loopNum = currentLoop ?? reading?.Looping ?? 1;
  const countNum = currentCount ?? reading?.Count ?? 0;
  const detailTime = reading?.DateTime || 'Menunggu data';
  const toggleTime = lastValveToggleTime || reading?.DateTime || 'Belum ada data';

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 shadow-xs dark:shadow-none transition-colors">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 sm:h-4 bg-emerald-500 rounded-xs inline-block" />
            <h2 className="text-xs sm:text-sm md:text-base font-semibold font-mono tracking-tight uppercase text-slate-900 dark:text-slate-100">
              Aktuator Katup & Looping Irigasi
            </h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Telemetri siklus buka dan tutup katup irigasi berdasarkan sensor kelembaban tanah
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border ${
              isValveOpen
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/80'
            }`}
          >
            STATUS: {isValveOpen ? 'OPEN (TERBUKA)' : 'CLOSED (TERTUTUP)'}
          </span>
        </div>
      </div>

      {/* Grid Parameter Detail */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Looping Ke- */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded p-2.5 sm:p-3">
          <div className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider mb-0.5">
            Looping Ke
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
            #{loopNum}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Siklus counter: #{countNum}
          </div>
        </div>

        {/* Status Katup */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded p-2.5 sm:p-3">
          <div className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider mb-0.5">
            Kondisi Katup
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
            {reading?.ValveStatus || 'CLOSED'}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Debit: {reading?.Debit !== undefined ? reading.Debit.toFixed(1) : '0.0'} L/min
          </div>
        </div>

        {/* Waktu Pembacaan Terkini */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded p-2.5 sm:p-3">
          <div className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider mb-0.5">
            Waktu Pembacaan
          </div>
          <div className="text-xs sm:text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
            {detailTime}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Sinkronisasi ESP32
          </div>
        </div>

        {/* Waktu Terakhir Buka/Tutup */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded p-2.5 sm:p-3">
          <div className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider mb-0.5">
            Transisi Terakhir
          </div>
          <div className="text-xs sm:text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
            {toggleTime}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Status: {reading?.ValveStatus || 'CLOSED'}
          </div>
        </div>
      </div>

      {/* Tabel Log Transisi Katup */}
      {valveEvents.length > 0 && (
        <div className="pt-1">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Riwayat Transisi Katup Terakhir
          </div>
          <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60">
                  <th className="py-2 px-3 text-left font-medium">Waktu Transisi</th>
                  <th className="py-2 px-3 text-center font-medium">Status Katup</th>
                  <th className="py-2 px-3 text-center font-medium">Looping</th>
                  <th className="py-2 px-3 text-center font-medium">Counter</th>
                  <th className="py-2 px-3 text-right font-medium">Debit (L/min)</th>
                  <th className="py-2 px-3 text-right font-medium">Total Debit (L)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {valveEvents.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-1.5 sm:py-2 px-3 text-slate-800 dark:text-slate-300 whitespace-nowrap">
                      {evt.DateTime}
                    </td>
                    <td className="py-1.5 sm:py-2 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                          evt.ValveStatus === 'OPEN'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {evt.ValveStatus}
                      </span>
                    </td>
                    <td className="py-1.5 sm:py-2 px-3 text-center text-slate-700 dark:text-slate-300">
                      {evt.Looping !== undefined ? evt.Looping : loopNum}
                    </td>
                    <td className="py-1.5 sm:py-2 px-3 text-center text-slate-500 dark:text-slate-400">
                      {evt.Count !== undefined ? evt.Count : '-'}
                    </td>
                    <td className="py-1.5 sm:py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                      {evt.Debit !== undefined ? evt.Debit.toFixed(1) : '-'}
                    </td>
                    <td className="py-1.5 sm:py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                      {evt.TotalDebit !== undefined ? evt.TotalDebit.toFixed(1) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
