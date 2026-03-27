import React from 'react';
import { useKernel } from '@/hooks/use-kernel';

interface StartMenuProps {
  onClose: () => void;
}

const APP_LIST = [
  { id: 'file-manager', name: 'File Manager', icon: '📁' },
  { id: 'writer', name: 'Writer', icon: '📝' },
  { id: 'calc', name: 'Calc', icon: '📊' },
  { id: 'notes', name: 'Notes', icon: '📋' },
  { id: 'draw', name: 'Draw', icon: '🎨' },
  { id: 'impress', name: 'Impress', icon: '📽️' },
  { id: 'terminal', name: 'Terminal', icon: '💻' },
  { id: 'text-editor', name: 'Text Editor', icon: '📄' },
  { id: 'calculator', name: 'Calculator', icon: '🔢' },
  { id: 'image-viewer', name: 'Image Viewer', icon: '🖼️' },
  { id: 'pdf-viewer', name: 'PDF Viewer', icon: '📕' },
  { id: 'task-manager', name: 'Task Manager', icon: '📈' },
  { id: 'settings', name: 'Settings', icon: '⚙️' },
];

export function StartMenu({ onClose }: StartMenuProps) {
  const [search, setSearch] = React.useState('');
  const { launchApp } = useKernel();
  const menuRef = React.useRef<HTMLDivElement>(null);

  const filtered = search
    ? APP_LIST.filter((app) =>
        app.name.toLowerCase().includes(search.toLowerCase()),
      )
    : APP_LIST;

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
      <div className="max-h-80 overflow-y-auto p-1">
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
    </div>
  );
}
