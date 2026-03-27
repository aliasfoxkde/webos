import { useCallback, useRef, useEffect } from 'react';
import type { WindowBounds, WindowSize } from './types';

interface ResizeOptions {
  windowId: string;
  bounds: WindowBounds;
  minSize?: WindowSize;
  onResize: (bounds: Partial<WindowBounds>) => void;
  onEnd?: () => void;
  disabled?: boolean;
}

export type ResizeHandle =
  | 'n' | 's' | 'e' | 'w'
  | 'ne' | 'nw' | 'se' | 'sw';

export function useWindowResize({
  windowId,
  bounds,
  minSize = { width: 320, height: 240 },
  onResize,
  onEnd,
  disabled,
}: ResizeOptions) {
  const isResizing = useRef(false);
  const handle = useRef<ResizeHandle | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startBounds = useRef<WindowBounds>({ ...bounds });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, direction: ResizeHandle) => {
      if (disabled || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      isResizing.current = true;
      handle.current = direction;
      startPos.current = { x: e.clientX, y: e.clientY };
      startBounds.current = { ...bounds };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled, bounds],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing.current || !handle.current) return;

      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      const s = startBounds.current;
      const newBounds: Partial<WindowBounds> = {};

      const dir = handle.current;

      // Horizontal
      if (dir === 'e' || dir === 'ne' || dir === 'se') {
        newBounds.width = Math.max(minSize.width, s.width + dx);
      }
      if (dir === 'w' || dir === 'nw' || dir === 'sw') {
        const newWidth = Math.max(minSize.width, s.width - dx);
        newBounds.width = newWidth;
        newBounds.x = s.x + (s.width - newWidth);
      }

      // Vertical
      if (dir === 's' || dir === 'se' || dir === 'sw') {
        newBounds.height = Math.max(minSize.height, s.height + dy);
      }
      if (dir === 'n' || dir === 'ne' || dir === 'nw') {
        const newHeight = Math.max(minSize.height, s.height - dy);
        newBounds.height = newHeight;
        newBounds.y = s.y + (s.height - newHeight);
      }

      onResize(newBounds);
    },
    [minSize, onResize],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing.current) return;

      isResizing.current = false;
      handle.current = null;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      onEnd?.();
    },
    [onEnd],
  );

  useEffect(() => {
    return () => {
      isResizing.current = false;
      handle.current = null;
    };
  }, []);

  return {
    handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    isResizing,
  };
}

export function getResizeCursor(direction: ResizeHandle): string {
  const map: Record<ResizeHandle, string> = {
    n: 'ns-resize',
    s: 'ns-resize',
    e: 'ew-resize',
    w: 'ew-resize',
    ne: 'nesw-resize',
    nw: 'nwse-resize',
    se: 'nwse-resize',
    sw: 'nesw-resize',
  };
  return map[direction];
}
