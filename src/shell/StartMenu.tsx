import React, { useMemo, useState } from 'react';
import { useKernel } from '@/hooks/use-kernel';
import { getAppList } from './app-list';

interface StartMenuProps {
  onClose: () => void;
  onLock?: () => void;
}

export function StartMenu({ onClose, onLock }: StartMenuProps) {
  const [search, setSearch] = React.useState('');
  const [showPower, setShowPower] = useState(false);
  const { launchApp } = useKernel();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const appList = useMemo(() => getAppList(), []);

  const filtered = search
    ? appList.filter((app) =>
        app.name.toLowerCase().includes(search.toLowerCase()),
      )
    : appList;

  const handleLaunch = (appId: string, name: string) => {
    launchApp(appId, name);
    onClose();
  };

  // Close on click outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleSleep = () => {
    onClose();
  };

  const handleLock = () => {
    onClose();
    onLock?.();
  };

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bottom-14 left-2 w-80 bg-[var(--os-menu-bg)] border border-[var(--os-menu-border)] rounded-lg shadow-[var(--os-shadow-xl)] z-[10000] overflow-hidden"
    >
      {/* Search */}
      <div className="p-3 border-b border-[var(--os-menu-border)]">
        <input
          type="text"
          placeholder="Search apps..."
          className="w-full px-3 py-1.5 rounded-md bg-[var(--os-bg-tertiary)] text-sm text-[var(--os-text-primary)] placeholder-[var(--os-text-muted)] outline-none border border-transparent focus:border-[var(--os-accent)]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* App List */}
      <div className="max-h-64 overflow-y-auto p-1">
        {filtered.map((app) => (
          <button
            key={app.id}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--os-text-primary)] hover:bg-[var(--os-menu-hover)] transition-colors"
            onClick={() => handleLaunch(app.id, app.name)}
          >
            <span className="text-xl">{app.icon}</span>
            <span>{app.name}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-[var(--os-text-muted)] py-4">
            No apps found
          </p>
        )}
      </div>

      {/* Footer: User + Power */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t border-[var(--os-menu-border)]"
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs"
            style={{ backgroundColor: 'var(--os-accent)' }}
          >
            U
          </div>
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--os-text-secondary)' }}
          >
            User
          </span>
        </div>

        {/* Power button */}
        <div className="relative">
          <button
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors hover:bg-[var(--os-menu-hover)]"
            style={{ color: 'var(--os-text-muted)' }}
            onClick={() => setShowPower((s) => !s)}
          >
            <span>⏻</span>
          </button>

          {showPower && (
            <div
              className="absolute bottom-full right-0 mb-1 w-40 rounded-lg border border-[var(--os-menu-border)] bg-[var(--os-menu-bg)] shadow-[var(--os-shadow-lg)] overflow-hidden"
            >
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-[var(--os-text-primary)] hover:bg-[var(--os-menu-hover)] transition-colors"
                onClick={handleLock}
              >
                <span>🔒</span> Lock
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-[var(--os-text-primary)] hover:bg-[var(--os-menu-hover)] transition-colors"
                onClick={handleSleep}
              >
                <span>😴</span> Sleep
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-[var(--os-text-primary)] hover:bg-[var(--os-menu-hover)] transition-colors"
                onClick={handleRestart}
              >
                <span>🔄</span> Restart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
