import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import { FileGrid } from './FileGrid';
import { Toolbar } from './Toolbar';
import { useFileOperations } from './use-file-operations';
import { readdir, stat, mkdir, writeFile } from '@/vfs/vfs';
import type { FileNode } from '@/vfs/types';

interface FileManagerProps {
  initialPath?: string;
}

export function FileManager({ initialPath = '/home' }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file?: FileNode;
  } | null>(null);

  const fileOps = useFileOperations();

  const loadDirectory = useCallback(async (path: string) => {
    const contents = await readdir(path);
    setFiles(contents);
  }, []);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  const navigate = useCallback(
    (path: string) => {
      const newHistory = [...history.slice(0, historyIndex + 1), path];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentPath(path);
    },
    [history, historyIndex],
  );

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
    }
  };

  const goUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    navigate('/' + parts.join('/'));
  };

  const handleOpen = async (file: FileNode) => {
    if (file.type === 'folder') {
      navigate(`${currentPath === '/' ? '' : currentPath}/${file.name}`);
    }
    // File opening will be handled by app registry in later phases
  };

  const handleNewFolder = async () => {
    const name = prompt('Folder name:');
    if (name) {
      await fileOps.createFolder(currentPath, name);
      loadDirectory(currentPath);
    }
  };

  const handleNewFile = async () => {
    const name = prompt('File name:');
    if (name) {
      await fileOps.createFile(currentPath, name);
      loadDirectory(currentPath);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, file?: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDelete = async () => {
    if (!contextMenu?.file) return;
    await fileOps.deleteItem(`${currentPath}/${contextMenu.file.name}`);
    loadDirectory(currentPath);
    handleCloseContextMenu();
  };

  return (
    <div
      className="flex flex-col h-full bg-[var(--os-bg-primary)]"
      onContextMenu={(e) => handleContextMenu(e)}
      onClick={handleCloseContextMenu}
    >
      {/* Toolbar */}
      <Toolbar
        currentPath={currentPath}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
        onBack={goBack}
        onForward={goForward}
        onUp={goUp}
        onRefresh={() => loadDirectory(currentPath)}
        onNewFolder={handleNewFolder}
        onNewFile={handleNewFile}
      />

      {/* Breadcrumb */}
      <div className="px-3 py-1 border-b border-[var(--os-border)] bg-[var(--os-bg-secondary)]">
        <Breadcrumb path={currentPath} onNavigate={navigate} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPath={currentPath} onNavigate={navigate} />
        <FileGrid files={files} onOpen={handleOpen} onContextMenu={handleContextMenu} />
      </div>

      {/* Status bar */}
      <div className="h-6 flex items-center px-3 text-[10px] text-[var(--os-text-muted)] border-t border-[var(--os-border)] bg-[var(--os-bg-secondary)]">
        {files.filter((f) => !f.isHidden).length} items
        {fileOps.loading && ' — Loading...'}
        {fileOps.error && ` — Error: ${fileOps.error}`}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[var(--os-menu-bg)] border border-[var(--os-menu-border)] rounded-lg shadow-[var(--os-shadow-lg)] z-[10001] py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.file ? (
            <>
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--os-text-primary)] hover:bg-[var(--os-menu-hover)]"
                onClick={() => {
                  handleOpen(contextMenu.file!);
                  handleCloseContextMenu();
                }}
              >
                Open
              </button>
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--os-text-secondary)] hover:bg-[var(--os-menu-hover)]"
                onClick={handleCloseContextMenu}
              >
                Rename
              </button>
              <div className="h-px bg-[var(--os-menu-border)] my-1 mx-2" />
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--os-error)] hover:bg-[var(--os-menu-hover)]"
                onClick={handleDelete}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--os-text-primary)] hover:bg-[var(--os-menu-hover)]"
                onClick={() => {
                  handleNewFolder();
                  handleCloseContextMenu();
                }}
              >
                New Folder
              </button>
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--os-text-primary)] hover:bg-[var(--os-menu-hover)]"
                onClick={() => {
                  handleNewFile();
                  handleCloseContextMenu();
                }}
              >
                New File
              </button>
              <div className="h-px bg-[var(--os-menu-border)] my-1 mx-2" />
              <button
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--os-text-secondary)] hover:bg-[var(--os-menu-hover)]"
                onClick={() => {
                  loadDirectory(currentPath);
                  handleCloseContextMenu();
                }}
              >
                Refresh
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
