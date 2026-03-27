import React from 'react';

export interface ContextMenuItem {
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  onClick: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Adjust position to stay within viewport
  const adjustedPosition = React.useMemo(() => {
    const menuWidth = 200;
    const menuHeight = items.length * 32;
    return {
      x: x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 8 : x,
      y: y + menuHeight > window.innerHeight - 48 ? window.innerHeight - menuHeight - 56 : y,
    };
  }, [x, y, items.length]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use setTimeout to avoid closing on the same right-click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-[var(--os-menu-bg)] border border-[var(--os-menu-border)] rounded-lg shadow-[var(--os-shadow-lg)] z-[10001] py-1 min-w-[180px]"
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div
            key={i}
            className="h-px bg-[var(--os-menu-border)] my-1 mx-2"
          />
        ) : (
          <button
            key={i}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
              item.disabled
                ? 'text-[var(--os-text-muted)] cursor-default'
                : 'text-[var(--os-text-primary)] hover:bg-[var(--os-menu-hover)] cursor-default'
            }`}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
          >
            {item.icon && <span className="w-4 text-center">{item.icon}</span>}
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <span className="text-[var(--os-text-muted)] ml-4">{item.shortcut}</span>
            )}
          </button>
        ),
      )}
    </div>
  );
}
