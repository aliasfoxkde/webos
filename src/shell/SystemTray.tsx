import React, { useEffect, useState } from 'react';
import { Clock } from './Clock';
import { useAuthStore } from '@/stores/auth-store';
import { getSyncStatus } from '@/vfs/sync-r2';

export function SystemTray() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [syncInfo, setSyncInfo] = useState({ queueLength: 0, lastSyncAt: 0 });

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
    <div className="flex items-center gap-2 px-2">
      {isAuthenticated && (
        <div className="flex items-center gap-1 text-[10px] text-[var(--os-text-muted)]">
          <span title={syncInfo.queueLength > 0 ? `${syncInfo.queueLength} files syncing` : 'Cloud synced'}>
            {syncInfo.queueLength > 0 ? '⇅' : '☁'}
          </span>
        </div>
      )}
      <Clock />
    </div>
  );
}
