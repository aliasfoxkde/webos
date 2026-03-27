import React, { useState, useCallback, useEffect } from 'react';
import { DesktopIcon } from './DesktopIcon';
import { ContextMenu } from './ContextMenu';
import { getDesktopContextMenuItems } from './context-menu-items';
import { useKernel } from '@/hooks/use-kernel';
import { getWallpaper, getSavedWallpaperId, cycleWallpaper } from './wallpapers';
import { mkdir, writeFile } from '@/vfs/vfs';
import { getAppList } from './app-list';
import { useDesktopLayoutStore } from './desktop-layout-store';

export function Desktop() {
  const { launchApp } = useKernel();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [wallpaper, setWallpaper] = useState(() => getWallpaper(getSavedWallpaperId()));

  // Desktop shortcuts: show first 8 registered apps
  const shortcuts = React.useMemo(() => getAppList().slice(0, 8), []);
  const iconPositions = useDesktopLayoutStore((s) => s.positions);
  const resetPositions = useDesktopLayoutStore((s) => s.resetPositions);

  // Listen for wallpaper changes from Settings app
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setWallpaper(getWallpaper(id));
    };
    window.addEventListener('webos:wallpaper-change', handler);
    return () => window.removeEventListener('webos:wallpaper-change', handler);
  }, []);

  const handleDoubleClick = (appId: string) => {
    launchApp(appId);
  };

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const contextItems = getDesktopContextMenuItems(
    async () => {
      try { await mkdir('/home/Desktop/New Folder'); } catch { /* exists */ }
    },
    async () => {
      try { await writeFile('/home/Desktop/Untitled.txt', ''); } catch { /* fail */ }
    },
    () => {
      // Refresh desktop
      window.location.reload();
    },
    () => {
      const next = cycleWallpaper();
      setWallpaper(next);
    },
    () => {
      launchApp('settings');
    },
    () => {
      launchApp('settings');
    },
    resetPositions,
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden transition-all duration-500"
      style={wallpaper.style}
      onContextMenu={handleContextMenu}
      onClick={closeContextMenu}
    >
      {/* Desktop Icons */}
      <div className="absolute inset-0 overflow-hidden">
        {shortcuts.map((shortcut) => {
          const pos = iconPositions[shortcut.id] ?? { x: 16, y: 16 };
          return (
            <div
              key={shortcut.id}
              className="absolute"
              style={{ left: pos.x, top: pos.y }}
            >
              <DesktopIcon
                appId={shortcut.id}
                name={shortcut.name}
                icon={shortcut.icon}
                onDoubleClick={() => handleDoubleClick(shortcut.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextItems}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
