'use client';

interface LiveIndicatorProps {
  isConnected: boolean;
}

export default function LiveIndicator({ isConnected }: LiveIndicatorProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${
        isConnected
          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
          : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
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
