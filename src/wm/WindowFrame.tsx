import React, { useCallback, useRef, useState } from 'react';
import { useWindowStore } from './window-store';
import { useWindowDrag } from './use-window-drag';
import { useWindowResize, getResizeCursor, type ResizeHandle } from './use-window-resize';
import { useWindowSnap } from './use-window-snap';
import { ContextMenu } from '@/shell/ContextMenu';
import { getWindowTitleBarMenuItems } from '@/shell/context-menu-items';
import type { WindowState } from './types';
import { MIN_WINDOW_SIZE } from './types';

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

export function WindowFrame({ window: win, children }: WindowFrameProps) {
  const { close, focus, minimize, maximize, restore, move, updateBounds } = useWindowStore();
  const titleBarRef = useRef<HTMLDivElement>(null);
  const [titleMenu, setTitleMenu] = useState<{ x: number; y: number } | null>(null);

  const handleDragMove = useCallback(
    (dx: number, dy: number) => {
      move(win.id, { x: win.bounds.x + dx, y: win.bounds.y + dy });
    },
    [win.id, win.bounds, move],
  );

  const handleDragEnd = useCallback(() => {
    windowSnap.stopSnapping();
  }, []);

  const drag = useWindowDrag({
    windowId: win.id,
    onMove: handleDragMove,
    onEnd: handleDragEnd,
    disabled: win.isMaximized,
  });

  const resize = useWindowResize({
    windowId: win.id,
    bounds: win.bounds,
    minSize: win.minBounds ?? MIN_WINDOW_SIZE,
    onResize: (b) => updateBounds(win.id, b),
    disabled: win.isMaximized,
  });

  const windowSnap = useWindowSnap({
    enabled: !win.isMaximized,
    onSnap: (position) => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      useWindowStore.getState().snap(win.id, position, viewport);
    },
    onUnsnap: () => {
      // Keep current bounds after drag if no snap detected
    },
  });

  const handleTitleBarPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;

      // Focus window on any title bar click
      focus(win.id);

      // If maximized, un-maximize and center on drag
      if (win.isMaximized) {
        restore(win.id);
        // Center the window on cursor
        const newWidth = win.prevBounds?.width ?? win.bounds.width;
        const newX = e.clientX - newWidth / 2;
        move(win.id, { x: newX });
      }

      drag.onPointerDown(e);
      windowSnap.startSnapping();
    },
    [win.id, win.isMaximized, focus, restore, move, drag, windowSnap],
  );

  const handleTitleBarPointerMove = useCallback(
    (e: React.PointerEvent) => {
      drag.onPointerMove(e);
      if (drag.isDragging.current) {
        windowSnap.checkSnap(e.clientX, e.clientY, {
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    },
    [drag, windowSnap],
  );

  const handleTitleBarPointerUp = useCallback(
    (e: React.PointerEvent) => {
      drag.onPointerUp(e);
      windowSnap.stopSnapping();
    },
    [drag, windowSnap],
  );

  const handleTitleBarDoubleClick = useCallback(() => {
    if (win.isMaximized) {
      restore(win.id);
    } else {
      maximize(win.id);
    }
  }, [win.id, win.isMaximized, maximize, restore]);

  const handleTitleBarContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setTitleMenu({ x: e.clientX, y: e.clientY });
    },
    [],
  );

  const closeTitleMenu = useCallback(() => setTitleMenu(null), []);

  const titleBarItems = getWindowTitleBarMenuItems(
    win.id,
    win.isMaximized,
    win.isMinimized,
  );

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent, direction: ResizeHandle) => {
      focus(win.id);
      resize.handlePointerDown(e, direction);
    },
    [win.id, focus, resize],
  );

  if (win.isMinimized && !win.isMinimizing) return null;

  // Minimize animation: shrink toward taskbar
  const minimizeTransform = win.isMinimizing
    ? 'scale(0.1) translateY(calc(100vh - 48px))'
    : undefined;

  // Restore animation: expand from taskbar
  const restoreTransform = win.isRestoring
    ? 'scale(0.1) translateY(calc(100vh - 48px))'
    : undefined;

  const animating = win.isMinimizing || win.isRestoring;

  const frameStyle: React.CSSProperties = win.isMaximized
    ? {
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: win.zIndex,
        transform: minimizeTransform ?? restoreTransform,
        transition: 'all 200ms ease-in',
        opacity: win.isMinimizing ? 0 : 1,
      }
    : {
        position: 'absolute',
        left: win.bounds.x,
        top: win.bounds.y,
        width: win.bounds.width,
        height: win.bounds.height,
        zIndex: win.zIndex,
        transform: minimizeTransform ?? restoreTransform ?? (win.snap !== 'none' ? undefined : 'translateZ(0)'),
        transition: animating || win.snap !== 'none' ? 'all 200ms ease-in' : undefined,
        opacity: win.isMinimizing ? 0 : 1,
      };

  const resizeHandles: { dir: ResizeHandle; className: string }[] = [
    { dir: 'n', className: 'top-0 left-2 right-2 h-1 cursor-ns-resize' },
    { dir: 's', className: 'bottom-0 left-2 right-2 h-1 cursor-ns-resize' },
    { dir: 'e', className: 'right-0 top-2 bottom-2 w-1 cursor-ew-resize' },
    { dir: 'w', className: 'left-0 top-2 bottom-2 w-1 cursor-ew-resize' },
    { dir: 'ne', className: 'top-0 right-0 w-3 h-3 cursor-nesw-resize' },
    { dir: 'nw', className: 'top-0 left-0 w-3 h-3 cursor-nwse-resize' },
    { dir: 'se', className: 'bottom-0 right-0 w-3 h-3 cursor-nwse-resize' },
    { dir: 'sw', className: 'bottom-0 left-0 w-3 h-3 cursor-nesw-resize' },
  ];

  return (
    <div
      className={`flex flex-col rounded-lg overflow-hidden shadow-xl border ${
        win.isActive
          ? 'border-[var(--wm-border-active)] shadow-2xl'
          : 'border-[var(--wm-border)] shadow-lg'
      }`}
      style={frameStyle}
      onPointerDown={() => focus(win.id)}
    >
      {/* Title Bar */}
      <div
        ref={titleBarRef}
        className={`flex items-center h-9 px-3 select-none shrink-0 ${
          win.isActive
            ? 'bg-[var(--wm-titlebar-bg-active)]'
            : 'bg-[var(--wm-titlebar-bg)]'
        }`}
        onPointerDown={handleTitleBarPointerDown}
        onPointerMove={handleTitleBarPointerMove}
        onPointerUp={handleTitleBarPointerUp}
        onDoubleClick={handleTitleBarDoubleClick}
        onContextMenu={handleTitleBarContextMenu}
        onClick={closeTitleMenu}
      >
        {/* App icon */}
        {win.icon && (
          <span className="text-sm mr-2 opacity-80">{win.icon}</span>
        )}

        {/* Title */}
        <span className={`flex-1 text-sm truncate ${
          win.isActive ? 'text-[var(--wm-title-active)]' : 'text-[var(--wm-title)]'
        }`}>
          {win.title}
        </span>

        {/* Window controls */}
        <div className="flex items-center gap-1 ml-2">
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-[var(--wm-title)] text-xs"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => minimize(win.id)}
            title="Minimize"
          >
            <span className="w-3 h-0.5 bg-current rounded" />
          </button>
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-[var(--wm-title)] text-xs"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => win.isMaximized ? restore(win.id) : maximize(win.id)}
            title={win.isMaximized ? 'Restore' : 'Maximize'}
          >
            {win.isMaximized ? (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="1" width="8" height="8" rx="1" />
                <path d="M1 4v7h7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="10" height="10" rx="1" />
              </svg>
            )}
          </button>
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/80 text-[var(--wm-title)] text-xs"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => close(win.id)}
            title="Close"
          >
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="2" y1="2" x2="10" y2="10" />
              <line x1="10" y1="2" x2="2" y2="10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-[var(--wm-content-bg)]">
        {children}
      </div>

      {/* Resize handles */}
      {!win.isMaximized && resizeHandles.map(({ dir, className }) => (
        <div
          key={dir}
          className={`absolute ${className}`}
          style={{ cursor: getResizeCursor(dir) }}
          onPointerDown={(e) => handleResizePointerDown(e, dir)}
          onPointerMove={resize.onPointerMove}
          onPointerUp={resize.onPointerUp}
        />
      ))}

      {/* Title bar context menu */}
      {titleMenu && (
        <ContextMenu
          x={titleMenu.x}
          y={titleMenu.y}
          items={titleBarItems}
          onClose={closeTitleMenu}
        />
      )}
    </div>
  );
}
