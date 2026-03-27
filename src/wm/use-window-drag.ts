import { useCallback, useRef, useEffect } from 'react';

interface DragOptions {
  windowId: string;
  onMove: (dx: number, dy: number) => void;
  onEnd?: () => void;
  disabled?: boolean;
}

export function useWindowDrag({ windowId, onMove, onEnd, disabled }: DragOptions) {
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      isDragging.current = true;
      startPos.current = { x: e.clientX, y: e.clientY };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;

      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;

      startPos.current = { x: e.clientX, y: e.clientY };
      onMove(dx, dy);
    },
    [onMove],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;

      isDragging.current = false;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      onEnd?.();
    },
    [onEnd],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isDragging.current = false;
    };
  }, []);

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    isDragging,
  };
}
