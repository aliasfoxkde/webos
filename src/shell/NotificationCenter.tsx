import { useEffect, useRef } from 'react';
import { useNotificationStore, ICONS } from './notifications';
import { useQuickSettingsStore } from '@/stores/quick-settings-store';
import type { NotificationType } from './notifications';

function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const history = useNotificationStore((s) => s.history);
  const clearHistory = useNotificationStore((s) => s.clearHistory);
  const removeFromHistory = useNotificationStore((s) => s.removeFromHistory);
  const dndEnabled = useQuickSettingsStore((s) => s.dndEnabled);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid immediate close from the click that opened it
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="fixed bottom-14 right-3 w-80 max-h-96 rounded-xl border shadow-2xl flex flex-col overflow-hidden z-[10001]"
      style={{
        backgroundColor: 'var(--os-menu-bg)',
        borderColor: 'var(--os-menu-border)',
        animation: 'notif-panel-in 0.2s ease-out',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'var(--os-menu-border)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'var(--os-text-primary)' }}>
          Notifications
        </span>
        {history.length > 0 && (
          <button
            className="text-[11px] px-2 py-0.5 rounded transition-colors cursor-pointer"
            style={{ color: 'var(--os-accent)', backgroundColor: 'var(--os-accent-muted)' }}
            onClick={clearHistory}
          >
            Clear All
          </button>
        )}
      </div>

      {/* DND Banner */}
      {dndEnabled && (
        <div
          className="px-3 py-1.5 text-center border-b"
          style={{ backgroundColor: 'var(--os-bg-tertiary)', borderColor: 'var(--os-menu-border)' }}
        >
          <span className="text-[11px]" style={{ color: 'var(--os-text-muted)' }}>
            Do Not Disturb is on
          </span>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-1">
            <span className="text-2xl">🔔</span>
            <span className="text-xs" style={{ color: 'var(--os-text-muted)' }}>
              No notifications
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {history.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-2 rounded-lg px-2.5 py-2 transition-colors"
                style={{ backgroundColor: 'var(--os-bg-secondary)' }}
              >
                <span className="text-sm shrink-0 mt-0.5">{ICONS[notif.type as NotificationType]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium" style={{ color: 'var(--os-text-primary)' }}>
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-[11px] leading-snug mt-0.5" style={{ color: 'var(--os-text-secondary)' }}>
                      {notif.message}
                    </p>
                  )}
                  <span className="text-[10px] mt-0.5 block" style={{ color: 'var(--os-text-muted)' }}>
                    {relativeTime(notif.timestamp)}
                  </span>
                </div>
                <button
                  className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-xs transition-colors cursor-pointer"
                  style={{ color: 'var(--os-text-muted)' }}
                  onClick={() => removeFromHistory(notif.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes notif-panel-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
