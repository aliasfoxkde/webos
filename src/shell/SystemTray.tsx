import { useEffect, useState } from 'react';
import { Clock } from './Clock';
import { useAuthStore } from '@/stores/auth-store';
import { getSyncStatus } from '@/vfs/sync-r2';

export function SystemTray() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [syncInfo, setSyncInfo] = useState({ queueLength: 0, lastSyncAt: 0 });
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const update = () => {
      setSyncInfo(getSyncStatus());
    };

    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <div className="flex items-center gap-1.5 px-2">
      {/* Volume */}
      <button
        className="w-6 h-6 flex items-center justify-center rounded text-xs transition-colors hover:bg-white/10"
        style={{ color: 'var(--os-text-muted)' }}
        onClick={() => setMuted((m) => !m)}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {/* Network */}
      <span
        className="w-6 h-6 flex items-center justify-center text-xs"
        style={{ color: 'var(--os-text-muted)' }}
        title="Connected"
      >
        📶
      </span>

      {/* Cloud Sync */}
      {isAuthenticated && (
        <span
          className="w-6 h-6 flex items-center justify-center text-xs"
          style={{ color: 'var(--os-text-muted)' }}
          title={
            syncInfo.queueLength > 0
              ? `${syncInfo.queueLength} files syncing`
              : 'Cloud synced'
          }
        >
          {syncInfo.queueLength > 0 ? '⇅' : '☁'}
        </span>
      )}

      {/* Notifications */}
      <span
        className="w-6 h-6 flex items-center justify-center text-xs"
        style={{ color: 'var(--os-text-muted)' }}
        title="No notifications"
      >
        🔔
      </span>

      <Clock />
    </div>
  );
}
