import { useEffect } from 'react';
import { useQuickSettingsStore } from '@/stores/quick-settings-store';

interface QuickSettingsProps {
  open: boolean;
  onClose: () => void;
}

const TOGGLES = [
  { key: 'wifiEnabled' as const, icon: '📶', label: 'WiFi' },
  { key: 'bluetoothEnabled' as const, icon: '🔵', label: 'Bluetooth' },
  { key: 'dndEnabled' as const, icon: '🔕', label: 'Do Not Disturb' },
  { key: 'nightModeEnabled' as const, icon: '🌙', label: 'Night Light' },
] as const;

export function QuickSettings({ open, onClose }: QuickSettingsProps) {
  const store = useQuickSettingsStore();
  const { nightModeEnabled, volume, brightness, toggleWifi, toggleBluetooth, toggleDnd, toggleNightMode, setVolume, setBrightness } = store;

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-quick-settings]')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  // Apply night mode filter to root
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.style.filter = nightModeEnabled ? 'sepia(0.2) brightness(0.9)' : '';
    }
    return () => {
      if (root) root.style.filter = '';
    };
  }, [nightModeEnabled]);

  // Apply brightness to desktop
  useEffect(() => {
    const desktop = document.querySelector('[data-desktop="true"]') as HTMLElement;
    if (desktop) {
      desktop.style.opacity = String(brightness / 100);
    }
  }, [brightness]);

  if (!open) return null;

  const toggleFn = (key: typeof TOGGLES[number]['key']) => {
    switch (key) {
      case 'wifiEnabled': return toggleWifi;
      case 'bluetoothEnabled': return toggleBluetooth;
      case 'dndEnabled': return toggleDnd;
      case 'nightModeEnabled': return toggleNightMode;
    }
  };

  return (
    <div
      data-quick-settings
      className="fixed bottom-14 right-2 w-72 rounded-lg border shadow-xl z-[10001] overflow-hidden"
      style={{
        backgroundColor: 'var(--os-menu-bg)',
        borderColor: 'var(--os-menu-border)',
        animation: 'qs-slide-in 0.15s ease-out',
      }}
    >
      <div className="p-4">
        {/* Toggle grid */}
        <div className="grid grid-cols-2 gap-2">
          {TOGGLES.map(({ key, icon, label }) => {
            const active = store[key];
            return (
              <button
                key={key}
                className="flex flex-col items-center gap-1.5 rounded-lg p-3 transition-colors"
                style={{
                  backgroundColor: active ? 'var(--os-accent)' : 'var(--os-bg-tertiary)',
                  color: active ? 'white' : 'var(--os-text-secondary)',
                }}
                onClick={() => toggleFn(key)()}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Sliders */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--os-text-muted)' }}>🔊</span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1 accent-[var(--os-accent)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--os-text-muted)' }}>☀️</span>
            <input
              type="range"
              min={50}
              max={100}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="flex-1 h-1 accent-[var(--os-accent)]"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes qs-slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
