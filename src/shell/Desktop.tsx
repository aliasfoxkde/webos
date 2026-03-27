import React, { useState, useCallback, useEffect } from 'react';
import { DesktopIcon } from './DesktopIcon';
import { ContextMenu } from './ContextMenu';
import { getDesktopContextMenuItems } from './context-menu-items';
import { useKernel } from '@/hooks/use-kernel';
import { getWallpaper, getSavedWallpaperId, cycleWallpaper } from './wallpapers';
import { mkdir, writeFile } from '@/vfs/vfs';

interface DesktopShortcut {
  name: string;
  icon?: string;
  appId: string;
}

const DEFAULT_SHORTCUTS: DesktopShortcut[] = [
  { name: 'File Manager', icon: '📁', appId: 'file-manager' },
  { name: 'Writer', icon: '📝', appId: 'writer' },
  { name: 'Calc', icon: '📊', appId: 'calc' },
  { name: 'Notes', icon: '📋', appId: 'notes' },
  { name: 'Draw', icon: '🎨', appId: 'draw' },
  { name: 'Impress', icon: '📽️', appId: 'impress' },
  { name: 'Terminal', icon: '💻', appId: 'terminal' },
  { name: 'Settings', icon: '⚙️', appId: 'settings' },
];

export function Desktop() {
  const { launchApp } = useKernel();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [wallpaper, setWallpaper] = useState(() => getWallpaper(getSavedWallpaperId()));

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
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden transition-all duration-500"
      style={wallpaper.style}
      onContextMenu={handleContextMenu}
      onClick={closeContextMenu}
    >
      {/* Desktop Icons Grid */}
      <div className="p-4 flex flex-col flex-wrap gap-1 h-[calc(100vh-48px)] content-start">
        {DEFAULT_SHORTCUTS.map((shortcut) => (
          <DesktopIcon
            key={shortcut.appId}
            name={shortcut.name}
            icon={shortcut.icon}
            onDoubleClick={() => handleDoubleClick(shortcut.appId)}
          />
        ))}
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
