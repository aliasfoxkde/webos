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
