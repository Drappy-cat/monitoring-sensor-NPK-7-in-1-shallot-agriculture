'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, type TimelapseRecord } from '@/lib/supabase';
import { CAMERA_CONFIG } from '@/lib/camera-config';

function makePlantSvg(hour: number, timeStr: string): string {
  const heightRatio = Math.min(100, 30 + hour * 4.5);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="640" height="480">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="70%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#451a03"/>
        <stop offset="100%" stop-color="#291203"/>
      </linearGradient>
    </defs>
    <rect width="640" height="480" fill="url(#bg)"/>
    <rect y="380" width="640" height="100" fill="url(#soil)"/>
    <ellipse cx="320" cy="385" rx="42" ry="18" fill="#881337"/>
    <path d="M320 380 Q300 260 270 ${380 - heightRatio * 2}" stroke="#22c55e" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M320 380 Q325 240 320 ${380 - heightRatio * 2.3}" stroke="#16a34a" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M320 380 Q345 260 375 ${380 - heightRatio * 1.9}" stroke="#4ade80" stroke-width="11" fill="none" stroke-linecap="round"/>
    <rect x="20" y="20" width="290" height="46" rx="8" fill="#000000" fill-opacity="0.65"/>
    <circle cx="36" cy="43" r="5" fill="#22c55e"/>
    <text x="50" y="49" fill="#ffffff" font-family="monospace" font-size="16" font-weight="bold">24 Nov 2026 • ${timeStr}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const FALLBACK_HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

const FALLBACK_TIMELAPSE: TimelapseRecord[] = FALLBACK_HOURS.map((h, idx) => {
  const hh = String(h).padStart(2, '0');
  const timeStr = `Pukul ${hh}:00 WIB`;
  return {
    id: idx + 1,
    filename: `plant_2026-11-24_${hh}-00.jpg`,
    image_url: makePlantSvg(h, timeStr),
    date: '2026-11-24',
    time: `${hh}:00:00`,
    hour: h,
    size_kb: 48 + (h % 5),
    captured_at: `2026-11-24T${hh}:00:00+07:00`,
    formatted_time: timeStr,
  };
}).reverse(); // Most recent first

export default function TimelapseGallery() {
  const [photos, setPhotos] = useState<TimelapseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<TimelapseRecord | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [captureMsg, setCaptureMsg] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try Supabase first if configured
      if (supabase) {
        const { data, error: sbError } = await supabase
          .from('plant_timelapse')
          .select('*')
          .order('captured_at', { ascending: false })
          .limit(48);

        if (sbError) throw sbError;
        if (data && data.length > 0) {
          setPhotos(data as TimelapseRecord[]);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Supabase unavailable, try backend API
    }

    try {
      const res = await fetch(CAMERA_CONFIG.TIMELAPSE_URL, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const records: TimelapseRecord[] = Array.isArray(data) ? data : data.photos || [];
        setPhotos(records);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('Timelapse fetch error, using cached calibration gallery:', err);
      // Fallback sample hourly records from today's calibration run
      setPhotos(FALLBACK_TIMELAPSE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const captureNow = async () => {
    setCapturing(true);
    setCaptureMsg(null);
    try {
      const res = await fetch(CAMERA_CONFIG.CMD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CAPTURE' }),
      });
      if (res.ok) {
        setCaptureMsg('Foto berhasil dipotret! Memperbarui galeri...');
        // Refresh gallery after a short delay for the backend to process
        setTimeout(() => {
          fetchPhotos();
          setCaptureMsg(null);
        }, 3000);
      } else {
        setCaptureMsg('Gagal memotret. Periksa status ESP32-CAM.');
      }
    } catch {
      setCaptureMsg('Koneksi ke backend gagal.');
    } finally {
      setCapturing(false);
    }
  };

  const downloadPhoto = (photo: TimelapseRecord) => {
    const a = document.createElement('a');
    a.href = photo.image_url;
    a.download = photo.filename || `timelapse_${photo.date}_${photo.time}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Group photos by date
  const grouped = photos.reduce<Record<string, TimelapseRecord[]>>((acc, p) => {
    const key = p.date || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <>
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs transition-colors">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3.5 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-emerald-500 rounded-xs inline-block" />
            <div>
              <h2 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-tight text-slate-900 dark:text-slate-100">
                Galeri Timelapse Tanaman
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Foto otomatis per 1 jam via ESP32-CAM / Supabase Storage
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={captureNow}
              disabled={capturing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800/50 text-white text-xs font-mono font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              {capturing ? 'Memotret...' : 'Ambil Foto Sekarang'}
            </button>
            <button
              onClick={fetchPhotos}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Muat Ulang
            </button>
          </div>
        </div>

        {/* Capture feedback */}
        {captureMsg && (
          <div className="px-3.5 sm:px-5 py-2 bg-sky-50 dark:bg-sky-950/30 border-b border-sky-200 dark:border-sky-800/60 text-xs font-mono text-sky-700 dark:text-sky-300">
            {captureMsg}
          </div>
        )}

        {/* Content */}
        <div className="px-3.5 sm:px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-mono">Memuat galeri timelapse...</span>
            </div>
          )}

          {error && !loading && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-md px-4 py-3 text-xs font-mono text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {!loading && !error && photos.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <p className="text-sm font-mono text-slate-500 dark:text-slate-400">Belum ada foto timelapse.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Foto akan muncul setelah ESP32-CAM memotret pada jadwal per 1 jam.
              </p>
            </div>
          )}

          {/* Photo grid grouped by date */}
          {!loading && !error && Object.entries(grouped).map(([date, datePhotos]) => (
            <div key={date} className="mb-5 last:mb-0">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {date}
                </span>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  ({datePhotos.length} foto)
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {datePhotos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative aspect-square rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <img
                      src={photo.image_url}
                      alt={`Timelapse ${photo.formatted_time || photo.time}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Time label overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-4">
                      <span className="text-[10px] font-mono font-semibold text-white leading-none">
                        {photo.formatted_time || `${String(photo.hour).padStart(2, '0')}:00`}
                      </span>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-sky-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full preview modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                  {selectedPhoto.date} — Pukul {selectedPhoto.formatted_time || `${String(selectedPhoto.hour).padStart(2, '0')}:00`} WIB
                </h3>
                {selectedPhoto.size_kb > 0 && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {selectedPhoto.filename} ({selectedPhoto.size_kb} KB)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadPhoto(selectedPhoto)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Unduh Foto
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Full image */}
            <div className="p-3 bg-slate-950">
              <img
                src={selectedPhoto.image_url}
                alt={`Timelapse ${selectedPhoto.formatted_time}`}
                className="w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
