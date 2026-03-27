import React, { useRef, useCallback } from 'react';
import { useDesktopLayoutStore } from './desktop-layout-store';

interface DesktopIconProps {
  appId?: string;
  name: string;
  icon?: string;
  onDoubleClick: () => void;
}

export function DesktopIcon({ appId, name, icon, onDoubleClick }: DesktopIconProps) {
  const [selected, setSelected] = React.useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const dragMoved = useRef(false);

  const setPosition = useDesktopLayoutStore((s) => s.setPosition);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const el = e.currentTarget.parentElement!;
      const rect = el.getBoundingClientRect();
      dragStart.current = {
        x: rect.left,
        y: rect.top,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };
      isDragging.current = false;
      dragMoved.current = false;
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current.x) return;
      const dx = e.clientX - dragStart.current.offsetX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.offsetY - dragStart.current.y;

      if (!isDragging.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        isDragging.current = true;
        dragMoved.current = true;
        (e.currentTarget.parentElement as HTMLElement).style.zIndex = '10';
      }

      if (isDragging.current) {
        const newX = dragStart.current.x + dx;
        const newY = dragStart.current.y + dy;
        (e.currentTarget.parentElement as HTMLElement).style.left = `${newX}px`;
        (e.currentTarget.parentElement as HTMLElement).style.top = `${newY}px`;
      }
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current.x) return;

      if (isDragging.current && appId) {
        const el = e.currentTarget.parentElement!;
        const newX = parseInt(el.style.left) || dragStart.current.x;
        const newY = parseInt(el.style.top) || dragStart.current.y;
        setPosition(appId, { x: newX, y: newY });
        (el as HTMLElement).style.zIndex = '';
      }

      dragStart.current = { x: 0, y: 0, offsetX: 0, offsetY: 0 };
      isDragging.current = false;
    },
    [appId, setPosition],
  );

  const handleClick = useCallback(() => {
    if (!dragMoved.current) {
      setSelected((s) => !s);
    }
    dragMoved.current = false;
  }, []);

  return (
    <div
      className="absolute"
      style={{ width: 80, height: 96 }}
    >
      <button
        className="flex h-full w-full flex-col items-center justify-center gap-1 p-1 rounded-lg transition-all duration-150 select-none cursor-default"
        style={{
          backgroundColor: selected ? 'var(--os-accent-muted)' : 'transparent',
          boxShadow: selected
            ? 'inset 0 0 0 1.5px var(--os-accent)'
            : 'none',
        }}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
        onBlur={() => setSelected(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseEnter={(e) => {
          if (!selected) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!selected) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {icon ? (
          <span className="text-3xl mb-1 drop-shadow-lg">{icon}</span>
        ) : (
          <div
            className="w-10 h-10 rounded flex items-center justify-center mb-1"
            style={{ backgroundColor: 'var(--os-accent-muted)' }}
          >
            <svg
              className="w-6 h-6"
              style={{ color: 'var(--os-text-secondary)' }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="4" y="2" width="16" height="20" rx="2" />
            </svg>
          </div>
        )}
        <span
          className="text-[11px] text-center leading-tight line-clamp-2 drop-shadow-md px-0.5"
          style={{
            color: 'var(--os-text-primary)',
            textShadow: selected ? 'none' : '0 1px 3px rgba(0,0,0,0.8)',
          }}
        >
          {name}
        </span>
      </button>
    </div>
  );
}
