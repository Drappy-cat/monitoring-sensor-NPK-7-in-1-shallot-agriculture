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
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 md:p-5 space-y-4">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-sm inline-block" />
            <h2 className="text-sm md:text-base font-semibold text-slate-100 font-mono tracking-tight uppercase">
              Aktuator Katup & Looping Irigasi
            </h2>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Telemetri siklus buka dan tutup katup irigasi berdasarkan sensor kelembaban tanah
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-3 py-1 rounded text-xs font-mono font-semibold border ${
              isValveOpen
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/80'
                : 'bg-rose-950/60 text-rose-300 border-rose-700/80'
            }`}
          >
            STATUS: {isValveOpen ? 'OPEN (TERBUKA)' : 'CLOSED (TERTUTUP)'}
          </span>
        </div>
      </div>

      {/* Grid Parameter Detail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Looping Ke- */}
        <div className="bg-slate-950/40 border border-slate-800 rounded p-3">
          <div className="text-slate-400 text-[11px] font-mono uppercase tracking-wider mb-1">
            Looping Ke
          </div>
          <div className="text-2xl font-mono font-bold text-slate-100">
            {loopNum}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Siklus counter: #{countNum}
          </div>
        </div>

        {/* Status Katup */}
        <div className="bg-slate-950/40 border border-slate-800 rounded p-3">
          <div className="text-slate-400 text-[11px] font-mono uppercase tracking-wider mb-1">
            Kondisi Katup
          </div>
          <div className="text-2xl font-mono font-bold text-slate-100">
            {reading?.ValveStatus || 'CLOSED'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Debit: {reading?.Debit !== undefined ? reading.Debit.toFixed(1) : '0.0'} L/min
          </div>
        </div>

        {/* Waktu Pembacaan Terkini */}
        <div className="bg-slate-950/40 border border-slate-800 rounded p-3">
          <div className="text-slate-400 text-[11px] font-mono uppercase tracking-wider mb-1">
            Waktu Detail Pembacaan
          </div>
          <div className="text-sm font-mono font-semibold text-slate-200">
            {detailTime}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Timestamp data ESP32
          </div>
        </div>

        {/* Waktu Terakhir Buka/Tutup */}
        <div className="bg-slate-950/40 border border-slate-800 rounded p-3">
          <div className="text-slate-400 text-[11px] font-mono uppercase tracking-wider mb-1">
            Waktu Transisi Terakhir
          </div>
          <div className="text-sm font-mono font-semibold text-slate-200">
            {toggleTime}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Kondisi: {reading?.ValveStatus || 'CLOSED'}
          </div>
        </div>
      </div>

      {/* Tabel Log Transisi Katup */}
      {valveEvents.length > 0 && (
        <div className="pt-1">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Riwayat Transisi Katup
          </div>
          <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950/60">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                  <th className="py-2 px-3 text-left font-medium">Waktu Transisi</th>
                  <th className="py-2 px-3 text-center font-medium">Status Katup</th>
                  <th className="py-2 px-3 text-center font-medium">Looping</th>
                  <th className="py-2 px-3 text-center font-medium">Counter</th>
                  <th className="py-2 px-3 text-right font-medium">Debit (L/min)</th>
                  <th className="py-2 px-3 text-right font-medium">Total Debit (L)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {valveEvents.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 text-slate-300">{evt.DateTime}</td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          evt.ValveStatus === 'OPEN'
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950/50 text-rose-300 border-rose-800'
                        }`}
                      >
                        {evt.ValveStatus}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center text-slate-300">
                      {evt.Looping !== undefined ? evt.Looping : loopNum}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-400">
                      {evt.Count !== undefined ? evt.Count : '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">
                      {evt.Debit !== undefined ? evt.Debit.toFixed(1) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">
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
