import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  add: (notification: Omit<Notification, 'id'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  add(notification) {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const entry: Notification = { id, duration: 3500, ...notification };
    set((state) => ({
      notifications: [...state.notifications, entry],
    }));

    // Auto-dismiss
    if (entry.duration && entry.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, entry.duration);
    }
  },

  dismiss(id) {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clear() {
    set({ notifications: [] });
  },
}));

const ICONS: Record<NotificationType, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

const BORDER_COLORS: Record<NotificationType, string> = {
  info: 'var(--os-accent)',
  success: 'var(--os-success)',
  warning: 'var(--os-warning)',
  error: 'var(--os-error)',
};

export function NotificationContainer() {
  const notifications = useNotificationStore((s) => s.notifications);
  const dismiss = useNotificationStore((s) => s.dismiss);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-14 right-3 z-[99999] flex flex-col gap-2 pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto max-w-sm rounded-lg border px-4 py-3 shadow-lg"
          style={{
            backgroundColor: 'var(--os-menu-bg)',
            borderColor: BORDER_COLORS[notif.type],
            borderLeftWidth: '3px',
            animation: 'notif-slide-in 0.25s ease-out',
          }}
          onClick={() => dismiss(notif.id)}
        >
          <div className="flex items-start gap-2">
            <span className="text-sm shrink-0">{ICONS[notif.type]}</span>
            <div className="min-w-0">
              <p
                className="text-xs font-medium"
                style={{ color: 'var(--os-text-primary)' }}
              >
                {notif.title}
              </p>
              {notif.message && (
                <p
                  className="mt-0.5 text-[11px] leading-snug"
                  style={{ color: 'var(--os-text-secondary)' }}
                >
                  {notif.message}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes notif-slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
