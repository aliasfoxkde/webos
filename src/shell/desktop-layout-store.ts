import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAppList } from './app-list';

const ICON_WIDTH = 80;
const ICON_HEIGHT = 96;
const ICON_GAP = 4;
const PADDING = 16;
const COLUMNS = 4;

interface DesktopLayoutState {
  positions: Record<string, { x: number; y: number }>;
  setPosition: (id: string, pos: { x: number; y: number }) => void;
  resetPositions: () => void;
}

function getDefaultPositions(): Record<string, { x: number; y: number }> {
  const apps = getAppList().slice(0, 8);
  const positions: Record<string, { x: number; y: number }> = {};
  apps.forEach((app, i) => {
    const col = i % COLUMNS;
    const row = Math.floor(i / COLUMNS);
    positions[app.id] = {
      x: PADDING + col * (ICON_WIDTH + ICON_GAP),
      y: PADDING + row * (ICON_HEIGHT + ICON_GAP),
    };
  });
  return positions;
}

export const useDesktopLayoutStore = create<DesktopLayoutState>()(
  persist(
    (set) => ({
      positions: getDefaultPositions(),
      setPosition: (id, pos) =>
        set((s) => ({ positions: { ...s.positions, [id]: pos } })),
      resetPositions: () => set({ positions: getDefaultPositions() }),
    }),
    { name: 'webos-desktop-layout' },
  ),
);
