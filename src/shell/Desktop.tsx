import React from 'react';
import { DesktopIcon } from './DesktopIcon';
import { useKernel } from '@/hooks/use-kernel';

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

  const handleDoubleClick = (appId: string) => {
    launchApp(appId);
  };

  return (
    <div className="fixed inset-0 bg-[var(--os-desktop-bg)] overflow-hidden">
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
    </div>
  );
}
