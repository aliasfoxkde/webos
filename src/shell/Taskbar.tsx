import React, { useState, useCallback } from 'react';
import { useWindowStore } from '@/wm/window-store';
import { SystemTray } from './SystemTray';
import { StartMenu } from './StartMenu';
import { SearchBar } from './SearchBar';
import { ContextMenu } from './ContextMenu';
import { QuickSettings } from './QuickSettings';
import { getTaskbarContextMenuItems, getTaskbarWindowContextMenuItems } from './context-menu-items';
import { useKernel } from '@/hooks/use-kernel';

interface TaskbarProps {
  onLock?: () => void;
}

export function Taskbar({ onLock }: TaskbarProps) {
  const [showStartMenu, setShowStartMenu] = React.useState(false);
  const [showQuickSettings, setShowQuickSettings] = React.useState(false);
  const [taskbarMenu, setTaskbarMenu] = useState<{ x: number; y: number } | null>(null);
  const [winMenu, setWinMenu] = useState<{ x: number; y: number; windowId: string; title: string; isMinimized: boolean } | null>(null);
  const windows = useWindowStore((s) => s.windows);
  const focusWindow = useWindowStore((s) => s.focus);
  const { launchApp } = useKernel();

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

  const handleShowDesktop = useCallback(() => {
    const allWindows = useWindowStore.getState().getAll();
    for (const w of allWindows) {
      if (!w.isMinimized) {
        useWindowStore.getState().minimize(w.id);
      }
    }
  }, []);

  const handleTaskbarContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setTaskbarMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeTaskbarMenu = useCallback(() => {
    setTaskbarMenu(null);
  }, []);

  const closeWinMenu = useCallback(() => {
    setWinMenu(null);
  }, []);

  const handleWinContextMenu = useCallback(
    (e: React.MouseEvent, windowId: string, title: string, isMinimized: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      setWinMenu({ x: e.clientX, y: e.clientY, windowId, title, isMinimized });
    },
    [],
  );

  const taskbarItems = getTaskbarContextMenuItems(
    () => launchApp('task-manager'),
    handleShowDesktop,
  );

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 h-12 flex items-center px-2 gap-1 backdrop-blur-md z-[9999]"
        style={{
          backgroundColor: 'var(--os-taskbar-bg)',
          borderTop: '1px solid var(--os-taskbar-border)',
        }}
        onContextMenu={handleTaskbarContextMenu}
        onClick={() => {
          closeTaskbarMenu();
          closeWinMenu();
          setShowQuickSettings(false);
        }}
      >
        {/* Start Button */}
        <button
          className="h-8 px-3 rounded-md text-sm font-medium transition-colors shrink-0"
          style={{
            backgroundColor: showStartMenu
              ? 'var(--os-accent)'
              : 'transparent',
            color: showStartMenu
              ? 'white'
              : 'var(--os-text-primary)',
          }}
          onClick={() => setShowStartMenu((s) => !s)}
        >
          <span className="text-lg mr-1">⊞</span>
          Start
        </button>

        {/* Separator */}
        <div
          className="w-px h-6 mx-1 shrink-0"
          style={{ backgroundColor: 'var(--os-taskbar-border)' }}
        />

        {/* Search Bar */}
        <div className="shrink-0">
          <SearchBar />
        </div>

        {/* Separator */}
        <div
          className="w-px h-6 mx-1 shrink-0"
          style={{ backgroundColor: 'var(--os-taskbar-border)' }}
        />

        {/* Running Windows */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto min-w-0">
          {windows.map((win) => (
            <button
              key={win.id}
              className="h-8 px-3 rounded-md text-xs max-w-[180px] truncate transition-colors flex items-center gap-1.5 shrink-0"
              style={{
                backgroundColor: win.isActive
                  ? 'var(--os-bg-tertiary)'
                  : 'transparent',
                color: win.isActive
                  ? 'var(--os-text-primary)'
                  : win.isMinimized
                    ? 'var(--os-text-muted)'
                    : 'var(--os-text-secondary)',
                borderBottom: win.isActive
                  ? '2px solid var(--os-accent)'
                  : '2px solid transparent',
              }}
              onClick={() => handleTaskbarClick(win.id)}
              onContextMenu={(e) =>
                handleWinContextMenu(e, win.id, win.title, win.isMinimized)
              }
              title={win.title}
            >
              {win.icon && <span>{win.icon}</span>}
              <span className="truncate">{win.title}</span>
            </button>
          ))}
        </div>

        {/* Show Desktop Strip */}
        <div
          className="w-[6px] h-10 mx-1 shrink-0 rounded-sm cursor-pointer transition-colors"
          style={{
            borderLeft: '1px solid var(--os-taskbar-border)',
          }}
          onClick={(ev) => {
            ev.stopPropagation();
            handleShowDesktop();
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Show Desktop"
        />

        {/* System Tray */}
        <div onClick={() => setShowQuickSettings((s) => !s)}>
          <SystemTray />
        </div>
      </div>

      {/* Start Menu */}
      {showStartMenu && (
        <StartMenu onClose={() => setShowStartMenu(false)} onLock={onLock} />
      )}

      {/* Quick Settings */}
      <QuickSettings
        open={showQuickSettings}
        onClose={() => setShowQuickSettings(false)}
      />

      {/* Taskbar Context Menu */}
      {taskbarMenu && (
        <ContextMenu
          x={taskbarMenu.x}
          y={taskbarMenu.y}
          items={taskbarItems}
          onClose={closeTaskbarMenu}
        />
      )}

      {/* Window Button Context Menu */}
      {winMenu && (
        <ContextMenu
          x={winMenu.x}
          y={winMenu.y}
          items={getTaskbarWindowContextMenuItems(
            winMenu.windowId,
            winMenu.title,
            winMenu.isMinimized,
          )}
          onClose={closeWinMenu}
        />
      )}
    </>
  );
}
