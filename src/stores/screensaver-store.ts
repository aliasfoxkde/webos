import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ScreensaverType =
  | 'bubbles'
  | 'stars'
  | 'matrix'
  | 'particles'
  | 'waves'
  | 'fireworks'
  | 'neural';

interface ScreensaverState {
  enabled: boolean;
  type: ScreensaverType;
  idleTimeoutSeconds: number;
  setEnabled: (v: boolean) => void;
  setType: (v: ScreensaverType) => void;
  setIdleTimeoutSeconds: (v: number) => void;
}

export const useScreensaverStore = create<ScreensaverState>()(
  persist(
    (set) => ({
      enabled: true,
      type: 'stars',
      idleTimeoutSeconds: 120,
      setEnabled: (v) => set({ enabled: v }),
      setType: (v) => set({ type: v }),
      setIdleTimeoutSeconds: (v) =>
        set({ idleTimeoutSeconds: Math.max(60, Math.min(300, v)) }),
    }),
    { name: 'webos-screensaver' },
  ),
);
