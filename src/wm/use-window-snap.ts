import { useCallback, useRef } from 'react';
import type { SnapPosition, WindowSize } from './types';

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
      if (mouseX <= threshold && mouseY <= threshold) return 'top-left';
      if (mouseX >= width - threshold && mouseY <= threshold) return 'top-right';
      if (mouseX <= threshold && mouseY >= height - threshold) return 'bottom-left';
      if (mouseX >= width - threshold && mouseY >= height - threshold) return 'bottom-right';

      // Sides
      if (mouseX <= threshold) return 'left';
      if (mouseX >= width - threshold) return 'right';
      if (mouseY <= threshold) return 'top';
      if (mouseY >= height - threshold) return 'bottom';

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
