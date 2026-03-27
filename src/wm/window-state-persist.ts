import type { WindowBounds } from './types';

interface PersistedWindowState {
  id: string;
  appId: string;
  bounds: WindowBounds;
  isMaximized: boolean;
}

const STORAGE_KEY = 'window-states';

export async function saveWindowStates(
  windows: PersistedWindowState[],
): Promise<void> {
  try {
    const data = JSON.stringify(windows);
    localStorage.setItem(STORAGE_KEY, data);
  } catch {
    // Storage full or unavailable - silently ignore
  }
}

export async function loadWindowStates(): Promise<PersistedWindowState[]> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as PersistedWindowState[];
  } catch {
    return [];
  }
}

export async function getWindowState(appId: string): Promise<PersistedWindowState | undefined> {
  const states = await loadWindowStates();
  return states.find((s) => s.appId === appId);
}

export async function clearWindowStates(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
}
