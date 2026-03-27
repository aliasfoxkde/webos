import type { ContextMenuItem } from './ContextMenu';

export function getDesktopContextMenuItems(
  onNewFolder: () => void,
  onNewFile: () => void,
  onRefresh: () => void,
  onSettings: () => void,
  onAbout: () => void,
): ContextMenuItem[] {
  return [
    { label: 'New Folder', icon: '📁', onClick: onNewFolder },
    { label: 'New Text File', icon: '📄', onClick: onNewFile },
    { label: '', separator: true, onClick: () => {} },
    { label: 'Refresh', icon: '🔄', shortcut: 'F5', onClick: onRefresh },
    { label: '', separator: true, onClick: () => {} },
    { label: 'Settings', icon: '⚙️', onClick: onSettings },
    { label: 'About WebOS', icon: 'ℹ️', onClick: onAbout },
  ];
}
