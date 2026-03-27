import React from 'react';
import { useWindowStore } from '@/wm/window-store';
import { SystemTray } from './SystemTray';
import { StartMenu } from './StartMenu';
import { useKernel } from '@/hooks/use-kernel';

export function Taskbar() {
  const [showStartMenu, setShowStartMenu] = React.useState(false);
  const windows = useWindowStore((s) => s.windows);
  const focusWindow = useWindowStore((s) => s.focus);
  const { apps } = useKernel();

  const handleTaskbarClick = (windowId: string) => {
    const win = useWindowStore.getState().get(windowId);
    if (!win) return;

    if (win.isMinimized) {
      useWindowStore.getState().restore(windowId);
    } else if (win.isActive) {
      useWindowStore.getState().minimize(windowId);
    } else {
      focusWindow(windowId);
    }
  };

  const toggleStartMenu = () => {
    setShowStartMenu((s) => !s);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-[var(--os-taskbar-bg)] border-t border-[var(--os-taskbar-border)] flex items-center px-2 gap-1 backdrop-blur-md z-[9999]">
        {/* Start Button */}
        <button
          className={`h-8 px-3 rounded-md text-sm font-medium transition-colors ${
            showStartMenu
              ? 'bg-[var(--os-accent)] text-white'
              : 'hover:bg-[var(--os-bg-tertiary)] text-[var(--os-text-primary)]'
          }`}
          onClick={toggleStartMenu}
        >
          <span className="text-lg mr-1">⊞</span>
          Start
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-[var(--os-taskbar-border)] mx-1" />

        {/* Running Windows */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {windows.map((win) => (
            <button
              key={win.id}
              className={`h-8 px-3 rounded-md text-xs max-w-[180px] truncate transition-colors flex items-center gap-1.5 ${
                win.isActive
                  ? 'bg-[var(--os-bg-tertiary)] text-[var(--os-text-primary)] border-b-2 border-[var(--os-accent)]'
                  : win.isMinimized
                    ? 'text-[var(--os-text-muted)] hover:bg-[var(--os-bg-hover)]'
                    : 'text-[var(--os-text-secondary)] hover:bg-[var(--os-bg-hover)]'
              }`}
              onClick={() => handleTaskbarClick(win.id)}
              title={win.title}
            >
              {win.icon && <span>{win.icon}</span>}
              <span className="truncate">{win.title}</span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <SystemTray />
      </div>

      {/* Start Menu */}
      {showStartMenu && (
        <StartMenu onClose={() => setShowStartMenu(false)} />
      )}
    </>
  );
}
