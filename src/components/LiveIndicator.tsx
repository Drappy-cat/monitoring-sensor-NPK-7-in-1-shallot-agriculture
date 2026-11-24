'use client';

interface LiveIndicatorProps {
  isConnected: boolean;
}

export default function LiveIndicator({ isConnected }: LiveIndicatorProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors ${
        isConnected
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
          : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          isConnected ? 'bg-emerald-400' : 'bg-rose-400'
        }`}
      />
      <span>{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
    </div>
  );
}
