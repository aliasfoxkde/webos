import { create } from 'zustand';
import { SnapPosition } from './types';
import type {
  WindowState,
  WindowConfig,
  WindowBounds,
  WindowSize,
} from './types';
import { DEFAULT_WINDOW_SIZE, MIN_WINDOW_SIZE, centerWindow } from './types';
import { eventBus } from '@/kernel/event-bus';
import { createLogger } from '@/lib/logger';
import {
  saveWindowStates,
} from './window-state-persist';
import type { PersistedWindowState } from './window-state-persist';

const log = createLogger('wm');

// Debounced persistence — saves at most once per 500ms
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(windows: WindowState[]) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const states: PersistedWindowState[] = windows.map((w) => ({
      id: w.id,
      appId: w.appId,
      bounds: w.bounds,
      isMaximized: w.isMaximized,
    }));
    saveWindowStates(states);
  }, 500);
}

// Synchronous read for use during open()
function loadWindowStatesSync(appId: string): PersistedWindowState | undefined {
  try {
    const data = localStorage.getItem('window-states');
    if (!data) return undefined;
    const states = JSON.parse(data) as PersistedWindowState[];
    return states.find((s) => s.appId === appId);
  } catch {
    return undefined;
  }
}

interface WindowStore {
  windows: WindowState[];
  zIndexCounter: number;

  open: (config: WindowConfig) => WindowState;
  close: (windowId: string) => void;
  focus: (windowId: string) => void;
  minimize: (windowId: string) => void;
  restore: (windowId: string) => void;
  maximize: (windowId: string) => void;
  snap: (windowId: string, position: SnapPosition, viewport: WindowSize) => void;
  move: (windowId: string, position: Partial<{ x: number; y: number }>) => void;
  resize: (windowId: string, size: Partial<{ width: number; height: number }>) => void;
  updateBounds: (windowId: string, bounds: Partial<WindowBounds>) => void;
  setTitle: (windowId: string, title: string) => void;
  get: (windowId: string) => WindowState | undefined;
  getByProcessId: (processId: string) => WindowState | undefined;
  getAll: () => WindowState[];
  getActive: () => WindowState | undefined;
  clear: () => void;
}

let nextZIndex = 1;

function getNextZIndex(): number {
  return nextZIndex++;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  zIndexCounter: 0,

  open(config) {
    const viewport: WindowSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    let width = config.bounds?.width ?? DEFAULT_WINDOW_SIZE.width;
    let height = config.bounds?.height ?? DEFAULT_WINDOW_SIZE.height;
    let position: { x: number; y: number } | undefined;

    // Restore saved bounds if available
    if (!config.bounds) {
      const saved = loadWindowStatesSync(config.appId);
      if (saved) {
        width = saved.bounds.width;
        height = saved.bounds.height;
        position = { x: saved.bounds.x, y: saved.bounds.y };
      }
    }

    if (!position) {
      position = config.bounds
        ? { x: config.bounds.x ?? 0, y: config.bounds.y ?? 0 }
        : centerWindow({ width, height }, viewport);
    }

    const bounds: WindowBounds = { ...position, width, height };
    const zIndex = getNextZIndex();

    const newWindow: WindowState = {
      id: `win-${config.processId}-${Date.now()}`,
      processId: config.processId,
      appId: config.appId,
      title: config.title,
      icon: config.icon,
      bounds,
      minBounds: config.minBounds ?? MIN_WINDOW_SIZE,
      maxBounds: config.maxBounds,
      zIndex,
      isMinimized: false,
      isMinimizing: false,
      isMaximized: false,
      isRestoring: false,
      snap: 'none' as SnapPosition,
      isActive: true,
    };

    set((state) => ({
      windows: [
        ...state.windows.map((w) => ({ ...w, isActive: false })),
        newWindow,
      ],
      zIndexCounter: zIndex,
    }));

    eventBus.emit('window:open', { windowId: newWindow.id, appId: config.appId });
    log.debug(`Window opened: ${newWindow.id} ("${config.appId}")`);
    return newWindow;
  },

  close(windowId) {
    const window = get().get(windowId);
    if (!window) return;

    log.debug(`Window closed: ${windowId}`);
    set((state) => {
      const remaining = state.windows.filter((w) => w.id !== windowId);
      const topWindow = remaining
        .filter((w) => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      return {
        windows: remaining.map((w) => ({
          ...w,
          isActive: topWindow ? w.id === topWindow.id : false,
        })),
      };
    });

    eventBus.emit('window:close', { windowId });
    scheduleSave(get().windows);
  },

  focus(windowId) {
    const window = get().get(windowId);
    if (!window) return;

    const zIndex = getNextZIndex();

    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId
          ? { ...w, isActive: true, isMinimized: false, zIndex }
          : { ...w, isActive: false },
      ),
      zIndexCounter: zIndex,
    }));

    eventBus.emit('window:focus', { windowId });
  },

  minimize(windowId) {
    // Start minimize animation
    set((state) => {
      const remaining = state.windows.filter((w) => w.id !== windowId && !w.isMinimized);
      const topWindow = remaining.sort((a, b) => b.zIndex - a.zIndex)[0];
      return {
        windows: state.windows.map((w) =>
          w.id === windowId
            ? { ...w, isMinimizing: true, isActive: false }
            : { ...w, isActive: topWindow ? w.id === topWindow.id : false },
        ),
      };
    });

    // After animation completes, hide the window
    setTimeout(() => {
      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === windowId
            ? { ...w, isMinimized: true, isMinimizing: false }
            : w,
        ),
      }));
      eventBus.emit('window:minimize', { windowId });
    }, 200);
  },

  restore(windowId) {
    const window = get().get(windowId);
    if (!window) return;

    const zIndex = getNextZIndex();
    const bounds = window.prevBounds ?? window.bounds;

    // Start restore animation (show window in minimized state first)
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId
          ? {
              ...w,
              isMinimized: false,
              isRestoring: true,
              isMaximized: false,
              snap: 'none' as SnapPosition,
              bounds,
              prevBounds: undefined,
              zIndex,
              isActive: true,
            }
          : { ...w, isActive: false },
      ),
      zIndexCounter: zIndex,
    }));

    // Clear restoring flag after animation
    setTimeout(() => {
      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === windowId ? { ...w, isRestoring: false } : w,
        ),
      }));
    }, 200);

    eventBus.emit('window:restore', { windowId });
  },

  maximize(windowId) {
    const window = get().get(windowId);
    if (!window) return;

    const viewport: WindowSize = {
      width: globalThis.innerWidth,
      height: globalThis.innerHeight,
    };

    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId
          ? {
              ...w,
              isMaximized: true,
              isMinimized: false,
              prevBounds: w.bounds,
              bounds: { x: 0, y: 0, ...viewport },
              snap: SnapPosition.Maximize,
            }
          : w,
      ),
    }));

    eventBus.emit('window:maximize', { windowId });
    scheduleSave(get().windows);
  },

  snap(windowId, position, viewport) {
    const window = get().get(windowId);
    if (!window) return;

    let bounds: WindowBounds;
    switch (position) {
      case 'left':
        bounds = { x: 0, y: 0, width: viewport.width / 2, height: viewport.height };
        break;
      case 'right':
        bounds = { x: viewport.width / 2, y: 0, width: viewport.width / 2, height: viewport.height };
        break;
      case 'top':
        bounds = { x: 0, y: 0, width: viewport.width, height: viewport.height / 2 };
        break;
      case 'bottom':
        bounds = { x: 0, y: viewport.height / 2, width: viewport.width, height: viewport.height / 2 };
        break;
      case 'top-left':
        bounds = { x: 0, y: 0, width: viewport.width / 2, height: viewport.height / 2 };
        break;
      case 'top-right':
        bounds = { x: viewport.width / 2, y: 0, width: viewport.width / 2, height: viewport.height / 2 };
        break;
      case 'bottom-left':
        bounds = { x: 0, y: viewport.height / 2, width: viewport.width / 2, height: viewport.height / 2 };
        break;
      case 'bottom-right':
        bounds = { x: viewport.width / 2, y: viewport.height / 2, width: viewport.width / 2, height: viewport.height / 2 };
        break;
      case 'maximize':
        bounds = { x: 0, y: 0, width: viewport.width, height: viewport.height };
        break;
      default:
        return;
    }

    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId
          ? {
              ...w,
              prevBounds: w.bounds,
              bounds,
              isMaximized: position === 'maximize',
              snap: position,
            }
          : w,
      ),
    }));
    scheduleSave(get().windows);
  },

  move(windowId, position) {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId
          ? { ...w, bounds: { ...w.bounds, ...position } }
          : w,
      ),
    }));
    scheduleSave(get().windows);
  },

  resize(windowId, size) {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId
          ? { ...w, bounds: { ...w.bounds, ...size } }
          : w,
      ),
    }));
    scheduleSave(get().windows);
  },

  updateBounds(windowId, bounds) {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId
          ? { ...w, bounds: { ...w.bounds, ...bounds } }
          : w,
      ),
    }));
  },

  setTitle(windowId, title) {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId ? { ...w, title } : w,
      ),
    }));
  },

  get(windowId) {
    return get().windows.find((w) => w.id === windowId);
  },

  getByProcessId(processId) {
    return get().windows.find((w) => w.processId === processId);
  },

  getAll() {
    return get().windows;
  },

  getActive() {
    return get().windows.find((w) => w.isActive);
  },

  clear() {
    set({ windows: [], zIndexCounter: 0 });
    nextZIndex = 1;
  },
}));
