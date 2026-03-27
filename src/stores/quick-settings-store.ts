import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QuickSettingsState {
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  dndEnabled: boolean;
  nightModeEnabled: boolean;
  volume: number;
  brightness: number;
  toggleWifi: () => void;
  toggleBluetooth: () => void;
  toggleDnd: () => void;
  toggleNightMode: () => void;
  setVolume: (v: number) => void;
  setBrightness: (v: number) => void;
}

export const useQuickSettingsStore = create<QuickSettingsState>()(
  persist(
    (set) => ({
      wifiEnabled: true,
      bluetoothEnabled: false,
      dndEnabled: false,
      nightModeEnabled: false,
      volume: 75,
      brightness: 100,

      toggleWifi: () => set((s) => ({ wifiEnabled: !s.wifiEnabled })),
      toggleBluetooth: () => set((s) => ({ bluetoothEnabled: !s.bluetoothEnabled })),
      toggleDnd: () => set((s) => ({ dndEnabled: !s.dndEnabled })),
      toggleNightMode: () => set((s) => ({ nightModeEnabled: !s.nightModeEnabled })),
      setVolume: (v) => set({ volume: Math.max(0, Math.min(100, v)) }),
      setBrightness: (v) => set({ brightness: Math.max(50, Math.min(100, v)) }),
    }),
    { name: 'webos-quick-settings' },
  ),
);
