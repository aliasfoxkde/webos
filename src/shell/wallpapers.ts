import type { CSSProperties } from 'react';

export interface Wallpaper {
  id: string;
  name: string;
  style: CSSProperties;
}

const wallpapers: Wallpaper[] = [
  {
    id: 'default-dark',
    name: 'Default Dark',
    style: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    style: { background: 'linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #283593 100%)' },
  },
  {
    id: 'forest',
    name: 'Forest',
    style: { background: 'linear-gradient(135deg, #0b1a0b 0%, #1b3a1b 50%, #2e5a2e 100%)' },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    style: { background: 'linear-gradient(135deg, #1a0a2e 0%, #4a1942 40%, #b45309 100%)' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    style: { background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)' },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    style: { background: 'linear-gradient(135deg, #042f2e 0%, #0f4c75 30%, #134e5e 60%, #0d3b66 100%)' },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    style: { background: 'linear-gradient(135deg, #1e1033 0%, #3b1f6e 50%, #5b21b6 100%)' },
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    style: { background: '#18181b' },
  },
];

const STORAGE_KEY = 'webos-wallpaper';

export function getSavedWallpaperId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'default-dark';
  } catch {
    return 'default-dark';
  }
}

export function saveWallpaperId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

export function getWallpaper(id: string): Wallpaper {
  return wallpapers.find((w) => w.id === id) ?? wallpapers[0];
}

export function getAllWallpapers(): Wallpaper[] {
  return [...wallpapers];
}

export function cycleWallpaper(): Wallpaper {
  const currentId = getSavedWallpaperId();
  const currentIndex = wallpapers.findIndex((w) => w.id === currentId);
  const nextIndex = (currentIndex + 1) % wallpapers.length;
  const next = wallpapers[nextIndex];
  saveWallpaperId(next.id);
  return next;
}
