import type { ContextMenuItem } from './ContextMenu';
import { useWindowStore } from '@/wm/window-store';

export function getWindowTitleBarMenuItems(
  windowId: string,
  isMaximized: boolean,
  isMinimized: boolean,
): ContextMenuItem[] {
  const store = useWindowStore.getState();
  return [
    {
      label: 'Restore',
      icon: '🔲',
      onClick: () => (isMaximized || isMinimized ? store.restore(windowId) : undefined),
      disabled: !isMaximized && !isMinimized,
    },
    {
      label: 'Minimize',
      icon: '➖',
      onClick: () => store.minimize(windowId),
      disabled: isMinimized,
    },
    {
      label: isMaximized ? 'Restore Down' : 'Maximize',
      icon: isMaximized ? '🔲' : '⛶',
      shortcut: '⊞+↑',
      onClick: () => (isMaximized ? store.restore(windowId) : store.maximize(windowId)),
    },
    { label: '', separator: true, onClick: () => {} },
    {
      label: 'Close',
      icon: '✕',
      shortcut: 'Alt+F4',
      onClick: () => store.close(windowId),
    },
  ];
}

export function getDesktopContextMenuItems(
  onNewFolder: () => void,
  onNewFile: () => void,
  onRefresh: () => void,
  onChangeWallpaper: () => void,
  onDisplaySettings: () => void,
  onAbout: () => void,
): ContextMenuItem[] {
  return [
    { label: 'New Folder', icon: '📁', onClick: onNewFolder },
    { label: 'New Text File', icon: '📄', onClick: onNewFile },
    { label: '', separator: true, onClick: () => {} },
    { label: 'Refresh', icon: '🔄', shortcut: 'F5', onClick: onRefresh },
    { label: '', separator: true, onClick: () => {} },
    { label: 'Change Wallpaper', icon: '🖼️', onClick: onChangeWallpaper },
    { label: 'Display Settings', icon: '🖥️', onClick: onDisplaySettings },
    { label: '', separator: true, onClick: () => {} },
    { label: 'Settings', icon: '⚙️', onClick: onDisplaySettings },
    { label: 'About WebOS', icon: 'ℹ️', onClick: onAbout },
  ];
}

export function getTaskbarContextMenuItems(
  onTaskManager: () => void,
  onShowDesktop: () => void,
): ContextMenuItem[] {
  return [
    { label: 'Task Manager', icon: '📈', onClick: onTaskManager },
    { label: 'Show Desktop', icon: '🖥️', shortcut: 'Win+D', onClick: onShowDesktop },
    { label: '', separator: true, onClick: () => {} },
    { label: 'Properties', icon: '📋', onClick: () => {} },
  ];
}

export function getTaskbarWindowContextMenuItems(
  windowId: string,
  _title: string,
  isMinimized: boolean,
): ContextMenuItem[] {
  const store = useWindowStore.getState();
  return [
    {
      label: isMinimized ? 'Restore' : 'Minimize',
      icon: isMinimized ? '🔲' : '➖',
      onClick: () => (isMinimized ? store.restore(windowId) : store.minimize(windowId)),
    },
    {
      label: 'Maximize',
      icon: '⛶',
      onClick: () => store.maximize(windowId),
    },
    { label: '', separator: true, onClick: () => {} },
    {
      label: 'Close',
      icon: '✕',
      onClick: () => store.close(windowId),
    },
  ];
}
