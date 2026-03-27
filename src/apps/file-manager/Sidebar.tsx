import React from 'react';
import { readdir } from '@/vfs/vfs';
import type { FileNode } from '@/vfs/types';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const QUICK_ACCESS = [
  { name: 'Desktop', path: '/home/Desktop', icon: '🖥️' },
  { name: 'Documents', path: '/home/Documents', icon: '📄' },
  { name: 'Downloads', path: '/home/Downloads', icon: '⬇️' },
  { name: 'Pictures', path: '/home/Pictures', icon: '🖼️' },
];

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  return (
    <div className="w-48 bg-[var(--os-bg-secondary)] border-r border-[var(--os-border)] flex flex-col overflow-y-auto shrink-0">
      {/* Quick Access */}
      <div className="p-2">
        <div className="text-[10px] font-semibold uppercase text-[var(--os-text-muted)] px-2 mb-1">
          Quick Access
        </div>
        {QUICK_ACCESS.map((item) => (
          <button
            key={item.path}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
              currentPath === item.path
                ? 'bg-[var(--os-accent)]/20 text-[var(--os-text-primary)]'
                : 'text-[var(--os-text-secondary)] hover:bg-[var(--os-bg-hover)]'
            }`}
            onClick={() => onNavigate(item.path)}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* Places */}
      <div className="p-2 border-t border-[var(--os-border)]">
        <div className="text-[10px] font-semibold uppercase text-[var(--os-text-muted)] px-2 mb-1">
          Places
        </div>
        {[
          { name: 'Home', path: '/home', icon: '🏠' },
          { name: 'System', path: '/system', icon: '🔧' },
          { name: 'Trash', path: '/trash', icon: '🗑️' },
        ].map((item) => (
          <button
            key={item.path}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
              currentPath === item.path
                ? 'bg-[var(--os-accent)]/20 text-[var(--os-text-primary)]'
                : 'text-[var(--os-text-secondary)] hover:bg-[var(--os-bg-hover)]'
            }`}
            onClick={() => onNavigate(item.path)}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
