import { useEffect, useState, useRef } from 'react';
import { Clock } from './Clock';
import { useAuthStore } from '@/stores/auth-store';
import { getSyncStatus } from '@/vfs/sync-r2';
import { useQuickSettingsStore } from '@/stores/quick-settings-store';

type PopupType = 'volume' | 'network' | 'calendar' | null;

interface SystemTrayProps {
  onNotificationBellClick: () => void;
  notificationCount: number;
}

export function SystemTray({ onNotificationBellClick, notificationCount }: SystemTrayProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [syncInfo, setSyncInfo] = useState({ queueLength: 0, lastSyncAt: 0 });
  const [activePopup, setActivePopup] = useState<PopupType>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const volume = useQuickSettingsStore((s) => s.volume);
  const setVolume = useQuickSettingsStore((s) => s.setVolume);
  const wifiEnabled = useQuickSettingsStore((s) => s.wifiEnabled);
  const toggleWifi = useQuickSettingsStore((s) => s.toggleWifi);

  useEffect(() => {
    if (!isAuthenticated) return;
    const update = () => setSyncInfo(getSyncStatus());
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Click outside to close popup
  useEffect(() => {
    if (!activePopup) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setActivePopup(null);
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [activePopup]);

  const togglePopup = (type: PopupType) => {
    setActivePopup((prev) => (prev === type ? null : type));
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const trayBtnClass = 'w-6 h-6 flex items-center justify-center rounded text-xs transition-colors cursor-pointer hover:bg-white/10';

  return (
    <div className="flex items-center gap-1.5 px-2">
      {/* Volume */}
      <button
        className={trayBtnClass}
        style={{ color: 'var(--os-text-muted)' }}
        onClick={() => togglePopup('volume')}
        title="Volume"
      >
        {volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
      </button>

      {/* Network */}
      <button
        className={trayBtnClass}
        style={{ color: 'var(--os-text-muted)' }}
        onClick={() => {
          toggleWifi();
          setActivePopup(null);
        }}
        title={wifiEnabled ? 'Connected' : 'Disconnected'}
      >
        {wifiEnabled ? '📶' : '📵'}
      </button>

      {/* Cloud Sync */}
      {isAuthenticated && (
        <span
          className="w-6 h-6 flex items-center justify-center text-xs"
          style={{ color: 'var(--os-text-muted)' }}
          title={syncInfo.queueLength > 0 ? `${syncInfo.queueLength} files syncing` : 'Cloud synced'}
        >
          {syncInfo.queueLength > 0 ? '⇅' : '☁'}
        </span>
      )}

      {/* Notifications */}
      <button
        className={trayBtnClass}
        style={{ color: 'var(--os-text-muted)' }}
        onClick={onNotificationBellClick}
        title="Notifications"
      >
        🔔
        {notificationCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ backgroundColor: 'var(--os-error)' }}
          >
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </button>

      {/* Clock / Calendar popup */}
      <div className="relative">
        <button
          className={trayBtnClass}
          style={{ color: 'var(--os-text-muted)' }}
          onClick={() => togglePopup('calendar')}
        >
          <Clock />
        </button>
      </div>

      {/* Popup */}
      {activePopup && (
        <div
          ref={popupRef}
          className="absolute bottom-full right-0 mb-2 w-56 rounded-xl border shadow-2xl p-3 z-[10001]"
          style={{
            backgroundColor: 'var(--os-menu-bg)',
            borderColor: 'var(--os-menu-border)',
            animation: 'tray-popup-in 0.15s ease-out',
          }}
        >
          {activePopup === 'volume' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--os-text-primary)' }}>Volume</span>
                <span className="text-xs" style={{ color: 'var(--os-text-secondary)' }}>{volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  accentColor: 'var(--os-accent)',
                  backgroundColor: 'var(--os-bg-tertiary)',
                }}
              />
            </div>
          )}
          {activePopup === 'calendar' && (
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--os-text-primary)' }}>
                {today.getDate()}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--os-text-secondary)' }}>
                {dateStr}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes tray-popup-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
