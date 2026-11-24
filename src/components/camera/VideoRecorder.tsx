'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { CAMERA_CONFIG } from '@/lib/camera-config';

interface VideoRecorderProps {
  streamImgRef: React.RefObject<HTMLImageElement | null>;
  isStreamLive: boolean;
}

type RecordState = 'idle' | 'recording' | 'done';

export default function VideoRecorder({ streamImgRef, isStreamLive }: VideoRecorderProps) {
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (frameRef.current) { clearInterval(frameRef.current); frameRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [cleanup, videoUrl]);

  const startRecording = useCallback(() => {
    if (!streamImgRef.current || !canvasRef.current) return;

    const img = streamImgRef.current;
    const canvas = canvasRef.current;

    // Set canvas size to match stream
    canvas.width = img.naturalWidth || 640;
    canvas.height = img.naturalHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create stream from canvas
    const canvasStream = canvas.captureStream(CAMERA_CONFIG.RECORD_FPS);

    // Try different mime types
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/mp4';

    chunksRef.current = [];
    const recorder = new MediaRecorder(canvasStream, { mimeType });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setRecordState('done');
      setShowPreview(true);

      // Auto download
      const now = new Date();
      const datePart = now.toISOString().split('T')[0];
      const timePart = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
      const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
      const filename = `video_demo_${datePart}_pukul_${timePart}.${ext}`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    // Draw frames from MJPEG img to canvas
    frameRef.current = setInterval(() => {
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }, 1000 / CAMERA_CONFIG.RECORD_FPS);

    recorder.start(100); // Collect data every 100ms
    mediaRecorderRef.current = recorder;
    setRecordState('recording');
    setElapsed(0);

    // Elapsed timer
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= CAMERA_CONFIG.RECORD_DURATION_SECONDS) {
          stopRecording();
        }
        return next;
      });
    }, 1000);
  }, [streamImgRef]);

  const stopRecording = useCallback(() => {
    cleanup();
    // onstop handler will fire and handle the blob
  }, [cleanup]);

  const closePreview = () => {
    setShowPreview(false);
    setRecordState('idle');
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
  };

  const remaining = CAMERA_CONFIG.RECORD_DURATION_SECONDS - elapsed;

  return (
    <>
      {/* Hidden canvas for recording */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Record controls */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs transition-colors">
        <div className="px-3.5 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-rose-500 rounded-xs inline-block" />
            <h2 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-tight text-slate-900 dark:text-slate-100">
              Rekam Video Demo
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Maks {CAMERA_CONFIG.RECORD_DURATION_SECONDS}s
          </span>
        </div>

        <div className="px-3.5 sm:px-5 py-3 flex flex-wrap items-center gap-2.5">
          {recordState === 'idle' && (
            <button
              onClick={startRecording}
              disabled={!isStreamLive}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-mono font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 ${
                isStreamLive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500'
                  : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>🎥</span>
              <span>Rekam Demo ({CAMERA_CONFIG.RECORD_DURATION_SECONDS}s)</span>
            </button>
          )}

          {recordState === 'recording' && (
            <>
              {/* Recording indicator */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-rose-600/10 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/60">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-300">
                  🔴 Merekam Video Demo ({remaining}s)
                </span>
              </div>
              <button
                onClick={stopRecording}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-800 text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                <span>⏹️</span>
                <span>Berhenti</span>
              </button>
              {/* Progress bar */}
              <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-rose-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(elapsed / CAMERA_CONFIG.RECORD_DURATION_SECONDS) * 100}%` }}
                />
              </div>
            </>
          )}

          {recordState === 'done' && !showPreview && (
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
              Video tersimpan ke perangkat Anda.
            </span>
          )}

          {!isStreamLive && recordState === 'idle' && (
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Aktifkan kamera live terlebih dahulu untuk merekam.
            </span>
          )}
        </div>
      </div>

      {/* Video preview modal */}
      {showPreview && videoUrl && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={closePreview}>
          <div
            className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 uppercase">
                Hasil Rekaman Demo
              </h3>
              <button
                onClick={closePreview}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full rounded-md bg-black"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
