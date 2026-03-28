import React, { useState, useRef } from 'react';
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
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const lastClickedRef = useRef<string | null>(null);

  const visibleFiles = files.filter((f) => !f.isHidden || f.name === '.');

  const handleClick = (e: React.MouseEvent, file: FileNode) => {
    if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      setSelectedFiles((prev) => {
        const next = new Set(prev);
        if (next.has(file.id)) {
          next.delete(file.id);
        } else {
          next.add(file.id);
        }
        return next;
      });
      lastClickedRef.current = file.id;
    } else if (e.shiftKey && lastClickedRef.current) {
      // Range select
      const ids = visibleFiles.map((f) => f.id);
      const lastIdx = ids.indexOf(lastClickedRef.current);
      const curIdx = ids.indexOf(file.id);
      if (lastIdx >= 0 && curIdx >= 0) {
        const [start, end] = [Math.min(lastIdx, curIdx), Math.max(lastIdx, curIdx)];
        const rangeIds = ids.slice(start, end + 1);
        setSelectedFiles(new Set(rangeIds));
      }
    } else {
      // Single click — clear other selections
      setSelectedFiles(new Set([file.id]));
      lastClickedRef.current = file.id;
    }
  };

  const handleDoubleClick = (file: FileNode) => {
    setSelectedFiles(new Set());
    onOpen(file);
  };

  return (
    <div className="flex-1 p-3 overflow-y-auto" onClick={() => setSelectedFiles(new Set())}>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2">
        {visibleFiles.map((file) => {
          const isSelected = selectedFiles.has(file.id);
          return (
            <button
              key={file.id}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-h-[80px] ${
                isSelected
                  ? 'bg-[var(--os-accent)] bg-opacity-20 ring-1 ring-[var(--os-accent)]'
                  : 'hover:bg-[var(--os-bg-hover)]'
              }`}
              onClick={(e) => handleClick(e, file)}
              onDoubleClick={() => handleDoubleClick(file)}
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
          );
        })}
      </div>
      {visibleFiles.length === 0 && (
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
