'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { CAMERA_CONFIG } from '@/lib/camera-config';

type StreamState = 'standby' | 'connecting' | 'live' | 'error';
type StreamSource = 'proxy' | 'direct';

interface CameraLiveStreamProps {
  onStreamActive?: (active: boolean) => void;
  imgRef?: React.RefObject<HTMLImageElement | null>;
}

export default function CameraLiveStream({ onStreamActive, imgRef: externalImgRef }: CameraLiveStreamProps) {
  const [streamState, setStreamState] = useState<StreamState>('standby');
  const [streamSource, setStreamSource] = useState<StreamSource>('proxy');
  const [countdown, setCountdown] = useState<number>(0);
  const [totalTimeout, setTotalTimeout] = useState<number>(CAMERA_CONFIG.DEFAULT_TIMEOUT_SECONDS);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const internalImgRef = useRef<HTMLImageElement | null>(null);
  const resolvedImgRef = externalImgRef || internalImgRef;
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamStartRef = useRef<number>(0);

  const stopStream = useCallback((reason: 'timeout' | 'manual' = 'manual') => {
    if (resolvedImgRef.current) {
      resolvedImgRef.current.src = '';
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setStreamState('standby');
    setCountdown(0);
    setTotalTimeout(CAMERA_CONFIG.DEFAULT_TIMEOUT_SECONDS);
    onStreamActive?.(false);

    setStatusMessage('Kamera kembali ke mode Standby hemat daya & RAM');
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  }, [onStreamActive, resolvedImgRef]);

  const getStreamUrl = useCallback(() => {
    if (streamSource === 'direct') {
      return `${CAMERA_CONFIG.ESP32_STREAM_URL}?t=${Date.now()}`;
    }
    return `${CAMERA_CONFIG.PROXY_STREAM_URL}?t=${Date.now()}`;
  }, [streamSource]);

  const startStream = useCallback(() => {
    setStreamState('connecting');
    setStatusMessage(null);
    const timeout = CAMERA_CONFIG.DEFAULT_TIMEOUT_SECONDS;
    setTotalTimeout(timeout);
    setCountdown(timeout);
    streamStartRef.current = Date.now();

    // Start MJPEG stream via img tag
    if (resolvedImgRef.current) {
      resolvedImgRef.current.src = getStreamUrl();
    }

    // Countdown ticker
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopStream('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopStream, resolvedImgRef, getStreamUrl]);

  const extendStream = useCallback(() => {
    const newTimeout = Math.min(
      countdown + CAMERA_CONFIG.EXTEND_SECONDS,
      CAMERA_CONFIG.MAX_TIMEOUT_SECONDS
    );
    setCountdown(newTimeout);
    setTotalTimeout(newTimeout);
  }, [countdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (resolvedImgRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        resolvedImgRef.current.src = '';
      }
    };
  }, [resolvedImgRef]);

  const handleImgLoad = () => {
    setStreamState('live');
    onStreamActive?.(true);
  };

  const handleImgError = () => {
    if (streamState === 'connecting' || streamState === 'live') {
      setStreamState('error');
      onStreamActive?.(false);
    }
  };

  const countdownPercent = totalTimeout > 0 ? (countdown / totalTimeout) * 100 : 0;
  const isUrgent = countdown > 0 && countdown <= 10;

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-sky-500 rounded-xs inline-block" />
          <h2 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-tight text-slate-900 dark:text-slate-100">
            Kamera Lapangan Live
          </h2>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold border ${
          streamState === 'live'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80'
            : streamState === 'connecting'
            ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/80'
            : streamState === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/80'
            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/80'
        }`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${
            streamState === 'live' ? 'bg-emerald-400 animate-pulse' :
            streamState === 'connecting' ? 'bg-amber-400 animate-pulse' :
            streamState === 'error' ? 'bg-rose-400' : 'bg-slate-400'
          }`} />
          {streamState === 'live' ? 'ESP32 ONLINE' :
           streamState === 'connecting' ? 'MENGHUBUNGKAN...' :
           streamState === 'error' ? 'KONEKSI GAGAL' : 'MODE SIAGA'}
        </div>
      </div>

      {/* Video viewport */}
      <div className="relative bg-slate-950 aspect-video flex items-center justify-center overflow-hidden">
        {/* MJPEG stream image */}
        <img
          ref={resolvedImgRef}
          alt="ESP32-CAM Live Stream"
          onLoad={handleImgLoad}
          onError={handleImgError}
          className={`w-full h-full object-contain ${streamState === 'live' ? 'block' : 'hidden'}`}
        />

        {/* Standby overlay */}
        {streamState === 'standby' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400 px-6">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9.75a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-mono font-semibold text-slate-300">Kamera dalam Mode Siaga</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                ESP32-CAM tidak aktif streaming. Tekan tombol di bawah untuk memulai video live.
              </p>
            </div>
          </div>
        )}

        {/* Connecting overlay */}
        {streamState === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-amber-400">
            <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono">Menghubungkan ke ESP32-CAM...</p>
          </div>
        )}

        {/* Error overlay */}
        {streamState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-rose-400 px-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-mono font-semibold">Koneksi Gagal</p>
              <p className="text-xs text-rose-300/70 mt-1">Periksa apakah ESP32-CAM dan backend relay aktif</p>
            </div>
          </div>
        )}

        {/* Countdown overlay (only when live) */}
        {streamState === 'live' && countdown > 0 && (
          <div className="absolute top-3 left-3 right-3 flex items-center gap-2">
            {/* Progress bar */}
            <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  isUrgent ? 'bg-rose-500' : 'bg-sky-400'
                }`}
                style={{ width: `${countdownPercent}%` }}
              />
            </div>
            {/* Countdown badge */}
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold backdrop-blur-sm ${
              isUrgent
                ? 'bg-rose-600/90 text-white animate-pulse'
                : 'bg-black/60 text-white/95'
            }`}>
              ⏳ Auto-Off: {countdown}s (Hemat RAM & Baterai)
            </span>
          </div>
        )}

        {/* LIVE badge */}
        {streamState === 'live' && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600/90 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-white">LIVE</span>
          </div>
        )}
      </div>

      {/* Standby notification banner */}
      {statusMessage && (
        <div className="px-3.5 sm:px-5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/60 text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <span>❄️</span>
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Controls */}
      <div className="px-3.5 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {streamState === 'standby' || streamState === 'error' ? (
            <button
              onClick={startStream}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-mono font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <span>📹</span>
              <span>Nyalakan Video</span>
            </button>
          ) : (
            <>
              <button
                onClick={extendStream}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <span>⏱️</span>
                <span>+30 Detik</span>
              </button>
              <button
                onClick={() => stopStream('manual')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <span>⏹️</span>
                <span>Tutup</span>
              </button>
            </>
          )}

          {/* Hemat daya info */}
          {streamState === 'standby' && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Mode Siaga hemat daya (ESP32 ~80mA, RAM 0%)
            </span>
          )}
        </div>

        {/* Stream Source Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-md text-[11px] font-mono border border-slate-200 dark:border-slate-700">
          <span className="text-slate-500 dark:text-slate-400 px-1">Sumber:</span>
          <button
            type="button"
            onClick={() => setStreamSource('proxy')}
            className={`px-2 py-0.5 rounded transition-colors ${
              streamSource === 'proxy'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Relay :5000
          </button>
          <button
            type="button"
            onClick={() => setStreamSource('direct')}
            className={`px-2 py-0.5 rounded transition-colors ${
              streamSource === 'direct'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Direct 192.168.1.6
          </button>
        </div>
      </div>
    </div>
  );
}
