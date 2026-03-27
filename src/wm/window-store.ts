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

const log = createLogger('wm');

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
    const width = config.bounds?.width ?? DEFAULT_WINDOW_SIZE.width;
    const height = config.bounds?.height ?? DEFAULT_WINDOW_SIZE.height;
    const position = config.bounds
      ? { x: config.bounds.x ?? 0, y: config.bounds.y ?? 0 }
      : centerWindow({ width, height }, viewport);

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
      isMaximized: false,
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
    set((state) => {
      const remaining = state.windows.filter((w) => w.id !== windowId && !w.isMinimized);
      const topWindow = remaining.sort((a, b) => b.zIndex - a.zIndex)[0];
      return {
        windows: state.windows.map((w) =>
          w.id === windowId
            ? { ...w, isMinimized: true, isActive: false }
            : { ...w, isActive: topWindow ? w.id === topWindow.id : false },
        ),
      };
    });

    const window = get().get(windowId);
    if (window) {
      eventBus.emit('window:minimize', { windowId });
    }
  },

  restore(windowId) {
    const window = get().get(windowId);
    if (!window) return;

    const zIndex = getNextZIndex();
    const bounds = window.prevBounds ?? window.bounds;

    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId
          ? {
              ...w,
              isMinimized: false,
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
  },

  move(windowId, position) {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId
          ? { ...w, bounds: { ...w.bounds, ...position } }
          : w,
      ),
    }));
  },

  resize(windowId, size) {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId
          ? { ...w, bounds: { ...w.bounds, ...size } }
          : w,
      ),
    }));
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
