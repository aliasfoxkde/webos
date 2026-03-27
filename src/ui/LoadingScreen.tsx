export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[var(--os-bg-primary)]">
      <div
        className="h-6 w-6 animate-spin rounded-full border-2 border-transparent"
        style={{ borderTopColor: 'var(--os-accent)' }}
      />
      <p className="text-xs text-[var(--os-text-muted)]">
        {message ?? 'Loading...'}
      </p>
    </div>
  );
}

export function BootScreen() {
  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center"
      style={{ backgroundColor: '#0f172a' }}
    >
      {/* Logo */}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-bold text-white"
        style={{
          backgroundColor: 'var(--os-accent)',
          animation: 'boot-pulse 1.5s ease-in-out',
        }}
      >
        W
      </div>

      {/* Title */}
      <h1
        className="mt-6 text-2xl font-bold"
        style={{
          color: 'var(--os-text-primary)',
          animation: 'boot-fade-in 1s ease-out 0.5s both',
        }}
      >
        WebOS
      </h1>

      {/* Progress bar */}
      <div
        className="mt-8 h-1 w-48 overflow-hidden rounded-full"
        style={{ backgroundColor: 'var(--os-bg-tertiary)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            backgroundColor: 'var(--os-accent)',
            animation: 'boot-progress 2s ease-in-out',
          }}
        />
      </div>

      {/* Loading text */}
      <p
        className="mt-4 text-xs"
        style={{
          color: 'var(--os-text-muted)',
          animation: 'boot-fade-in 1s ease-out 1s both',
        }}
      >
        Loading system...
      </p>

      {/* Keyframe styles */}
      <style>{`
        @keyframes boot-pulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes boot-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes boot-progress {
          0% { width: 0%; }
          60% { width: 80%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
