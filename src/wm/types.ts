export enum SnapPosition {
  None = 'none',
  Left = 'left',
  Right = 'right',
  Top = 'top',
  Bottom = 'bottom',
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
  Maximize = 'maximize',
}

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowBounds extends WindowPosition, WindowSize {}

export interface WindowState {
  id: string;
  processId: string;
  appId: string;
  title: string;
  icon?: string;
  bounds: WindowBounds;
  minBounds?: WindowSize;
  maxBounds?: WindowSize;
  zIndex: number;
  isMinimized: boolean;
  isMinimizing: boolean;
  isMaximized: boolean;
  isRestoring: boolean;
  snap: SnapPosition;
  prevBounds?: WindowBounds; // stored before maximize/snap for restore
  isActive: boolean;
}

export interface WindowConfig {
  processId: string;
  appId: string;
  title: string;
  icon?: string;
  bounds?: Partial<WindowBounds>;
  minBounds?: WindowSize;
  maxBounds?: WindowSize;
}

export const DEFAULT_WINDOW_SIZE: WindowSize = { width: 800, height: 600 };
export const MIN_WINDOW_SIZE: WindowSize = { width: 320, height: 240 };

export function centerWindow(size: WindowSize, viewport: WindowSize): WindowPosition {
  return {
    x: Math.max(0, Math.floor((viewport.width - size.width) / 2)),
    y: Math.max(0, Math.floor((viewport.height - size.height) / 2)),
  };
}

export function clampBounds(
  bounds: WindowBounds,
  viewport: WindowSize,
  minSize: WindowSize,
): WindowBounds {
  return {
    width: Math.max(minSize.width, Math.min(bounds.width, viewport.width)),
    height: Math.max(minSize.height, Math.min(bounds.height, viewport.height)),
    x: Math.max(0, Math.min(bounds.x, viewport.width - minSize.width)),
    y: Math.max(0, Math.min(bounds.y, viewport.height - minSize.height)),
  };
}
