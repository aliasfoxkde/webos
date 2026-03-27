import { useCallback, useRef } from 'react';
import { SnapPosition } from './types';
import type { WindowSize, WindowBounds } from './types';

interface SnapOptions {
  enabled?: boolean;
  snapThreshold?: number;
  onSnap: (position: SnapPosition) => void;
  onUnsnap?: () => void;
}

const SNAP_ZONE = 8;

export function useWindowSnap({
  enabled = true,
  snapThreshold = SNAP_ZONE,
  onSnap,
  onUnsnap,
}: SnapOptions) {
  const isSnapping = useRef(false);

  const detectSnap = useCallback(
    (
      mouseX: number,
      mouseY: number,
      viewport: WindowSize,
    ): SnapPosition | null => {
      if (!enabled) return null;

      const { width, height } = viewport;
      const threshold = snapThreshold;

      // Edges
      if (mouseX <= threshold && mouseY <= threshold) return SnapPosition.TopLeft;
      if (mouseX >= width - threshold && mouseY <= threshold) return SnapPosition.TopRight;
      if (mouseX <= threshold && mouseY >= height - threshold) return SnapPosition.BottomLeft;
      if (mouseX >= width - threshold && mouseY >= height - threshold) return SnapPosition.BottomRight;

      // Sides
      if (mouseX <= threshold) return SnapPosition.Left;
      if (mouseX >= width - threshold) return SnapPosition.Right;
      if (mouseY <= threshold) return SnapPosition.Top;
      if (mouseY >= height - threshold) return SnapPosition.Bottom;

      return null;
    },
    [enabled, snapThreshold],
  );

  const checkSnap = useCallback(
    (
      mouseX: number,
      mouseY: number,
      viewport: WindowSize,
    ): SnapPosition | null => {
      if (!isSnapping.current) return null;

      const position = detectSnap(mouseX, mouseY, viewport);
      if (position) {
        onSnap(position);
        return position;
      }

      return null;
    },
    [detectSnap, onSnap],
  );

  const startSnapping = useCallback(() => {
    isSnapping.current = true;
  }, []);

  const stopSnapping = useCallback(() => {
    if (isSnapping.current) {
      isSnapping.current = false;
      onUnsnap?.();
    }
  }, [onUnsnap]);

  return {
    detectSnap,
    checkSnap,
    startSnapping,
    stopSnapping,
  };
}

/** Calculate the bounds a window would occupy when snapped to a given position. */
export function getSnapBounds(position: SnapPosition, viewport: WindowSize): WindowBounds | null {
  const { width, height } = viewport;
  switch (position) {
    case SnapPosition.Left:
      return { x: 0, y: 0, width: width / 2, height };
    case SnapPosition.Right:
      return { x: width / 2, y: 0, width: width / 2, height };
    case SnapPosition.Top:
      return { x: 0, y: 0, width, height: height / 2 };
    case SnapPosition.Bottom:
      return { x: 0, y: height / 2, width, height: height / 2 };
    case SnapPosition.TopLeft:
      return { x: 0, y: 0, width: width / 2, height: height / 2 };
    case SnapPosition.TopRight:
      return { x: width / 2, y: 0, width: width / 2, height: height / 2 };
    case SnapPosition.BottomLeft:
      return { x: 0, y: height / 2, width: width / 2, height: height / 2 };
    case SnapPosition.BottomRight:
      return { x: width / 2, y: height / 2, width: width / 2, height: height / 2 };
    case SnapPosition.Maximize:
      return { x: 0, y: 0, width, height };
    default:
      return null;
  }
}
