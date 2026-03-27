import React from 'react';
import type { FileNode } from '@/vfs/types';

interface FileGridProps {
  files: FileNode[];
  onOpen: (file: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, file: FileNode) => void;
}

const FILE_ICONS: Record<string, string> = {
  folder: '📁',
  txt: '📄',
  md: '📝',
  pdf: '📕',
  png: '🖼️',
  jpg: '🖼️',
  jpeg: '🖼️',
  gif: '🖼️',
  svg: '🖼️',
  webp: '🖼️',
  html: '🌐',
  css: '🎨',
  js: '📜',
  ts: '📘',
  json: '📋',
  csv: '📊',
  zip: '📦',
  tar: '📦',
  gz: '📦',
  mp3: '🎵',
  wav: '🎵',
  mp4: '🎬',
};

function getFileIcon(file: FileNode): string {
  if (file.type === 'folder') return '📁';
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return FILE_ICONS[ext] ?? '📄';
}

function formatSize(size: number): string {
  if (size === 0) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileGrid({ files, onOpen, onContextMenu }: FileGridProps) {
  return (
    <div className="flex-1 p-3 overflow-y-auto">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2">
        {files
          .filter((f) => !f.isHidden || f.name === '.')
          .map((file) => (
            <button
              key={file.id}
              className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-[var(--os-bg-hover)] transition-colors min-h-[80px]"
              onDoubleClick={() => onOpen(file)}
              onContextMenu={(e) => onContextMenu(e, file)}
            >
              <span className="text-3xl mb-1">{getFileIcon(file)}</span>
              <span className="text-[11px] text-[var(--os-text-primary)] text-center leading-tight line-clamp-2 w-full">
                {file.name}
              </span>
              {file.type === 'file' && (
                <span className="text-[9px] text-[var(--os-text-muted)]">
                  {formatSize(file.size)}
                </span>
              )}
            </button>
          ))}
      </div>
      {files.filter((f) => !f.isHidden).length === 0 && (
        <div className="flex items-center justify-center h-full text-sm text-[var(--os-text-muted)]">
          This folder is empty
        </div>
      )}
    </div>
  );
}

export function getFileIconByName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return FILE_ICONS[ext] ?? '📄';
}
