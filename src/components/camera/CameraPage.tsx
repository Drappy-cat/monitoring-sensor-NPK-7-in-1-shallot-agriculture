'use client';

import { useState, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import ThemeToggle from '@/components/ThemeToggle';
import CameraLiveStream from '@/components/camera/CameraLiveStream';
import VideoRecorder from '@/components/camera/VideoRecorder';
import TimelapseGallery from '@/components/camera/TimelapseGallery';
import Link from 'next/link';

export default function CameraPage() {
  const { theme, toggleTheme, mounted } = useTheme();
  const [isStreamLive, setIsStreamLive] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-250">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-none transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-sky-500 rounded-xs inline-block shrink-0" />
              <h1 className="text-xs sm:text-sm md:text-base font-bold font-mono tracking-tight uppercase text-slate-900 dark:text-slate-100">
                Kamera Lapangan ESP32-CAM
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs font-mono mt-0.5">
              AI Thinker ESP32-CAM / MJPEG Stream / Timelapse Tanaman Bawang Merah
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start sm:self-auto">
            {/* Back to Telemetri */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-mono font-semibold border bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              TELEMETRI NPK
            </Link>

            {/* ESP32 status */}
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors ${
              isStreamLive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/80'
            }`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${isStreamLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              {isStreamLive ? 'ESP32 ONLINE' : 'MODE SIAGA'}
            </div>

            <ThemeToggle theme={theme} onToggle={toggleTheme} mounted={mounted} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
        {/* 1. Live Stream + Video Recorder side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="lg:col-span-2">
            <CameraLiveStream
              onStreamActive={setIsStreamLive}
              imgRef={imgRef}
            />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-5">
            <VideoRecorder
              streamImgRef={imgRef}
              isStreamLive={isStreamLive}
            />

            {/* Info card */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 sm:p-4 shadow-xs transition-colors space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-amber-500 rounded-xs inline-block" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-tight text-slate-900 dark:text-slate-100">
                  Spesifikasi Kamera
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-[11px] font-mono">
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded p-2">
                  <div className="text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Modul</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">AI Thinker</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded p-2">
                  <div className="text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Resolusi</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">VGA 640x480</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded p-2">
                  <div className="text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">FPS</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">~18-20</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded p-2">
                  <div className="text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Protokol</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">MJPEG</div>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 leading-relaxed">
                Stream auto-disconnect setelah timeout untuk menjaga suhu modul &lt;65°C dan menghemat daya idle ~80mA.
              </div>
            </div>
          </div>
        </div>

        {/* 2. Timelapse Gallery */}
        <section>
          <TimelapseGallery />
        </section>

        {/* Footer */}
        <footer className="text-center text-slate-500 dark:text-slate-500 font-mono text-[11px] sm:text-xs py-4 sm:py-5 border-t border-slate-200 dark:border-slate-800">
          ESP32-CAM AI Thinker — MJPEG Stream — Supabase Timelapse Storage — Monitoring Bawang Merah
        </footer>
      </main>
    </div>
  );
}
