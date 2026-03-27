import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { readFile, writeFile, mkdir, exists } from '@/vfs/vfs';

// ---------------------------------------------------------------------------
// Tab management types
// ---------------------------------------------------------------------------

interface EditorTab {
  id: string;
  path: string;
  name: string;
  modified: boolean;
  content: string;
}

// ---------------------------------------------------------------------------
// Detect language extension from file extension
// ---------------------------------------------------------------------------

function getLangExtension(filename: string): Extension[] {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return [javascript({ jsx: true })];
    case 'json':
      return [json()];
    case 'md':
    case 'markdown':
      return [markdown()];
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// TextEditor component
// ---------------------------------------------------------------------------

export function TextEditor() {
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [savePath, setSavePath] = useState('');
  const [openPath, setOpenPath] = useState('');
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [fileList, setFileList] = useState<string[]>([]);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const tabContentRef = useRef<Map<string, string>>(new Map());
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      editorViewRef.current?.destroy();
    };
  }, []);

  // Sync editor content to tab state when it changes
  const syncEditorContent = useCallback(() => {
    if (!editorViewRef.current || !activeTabId) return;
    const content = editorViewRef.current.state.doc.toString();
    tabContentRef.current.set(activeTabId, content);
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId ? { ...tab, content, modified: true } : tab,
      ),
    );
  }, [activeTabId]);

  // Create or recreate the CodeMirror editor
  const createEditor = useCallback(
    (content: string, filename: string) => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
      }

      if (!editorContainerRef.current) return;

      const extensions = [
        basicSetup,
        oneDark,
        ...getLangExtension(filename),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            syncEditorContent();
          }
        }),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-gutters': { backgroundColor: 'var(--os-bg-secondary)' },
        }),
      ];

      const state = EditorState.create({
        doc: content,
        extensions,
      });

      editorViewRef.current = new EditorView({
        state,
        parent: editorContainerRef.current,
      });
    },
    [syncEditorContent],
  );

  // Switch active tab
  const switchTab = useCallback(
    (tabId: string) => {
      // Save current content
      if (editorViewRef.current && activeTabId) {
        const content = editorViewRef.current.state.doc.toString();
        tabContentRef.current.set(activeTabId, content);
      }

      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return;

      const content = tabContentRef.current.get(tabId) ?? tab.content;
      createEditor(content, tab.name);
      setActiveTabId(tabId);
      setStatusMessage(tab.path || 'Untitled');
    },
    [activeTabId, tabs, createEditor],
  );

  // Open a file from VFS
  const openFile = useCallback(async (path: string) => {
    try {
      const node = await readFile(path);
      if (!node) {
        setStatusMessage(`File not found: ${path}`);
        return;
      }
      if (node.type === 'folder') {
        setStatusMessage(`Is a directory: ${path}`);
        return;
      }
      if (node.content instanceof ArrayBuffer) {
        setStatusMessage('Cannot open binary files');
        return;
      }

      const content = node.content ?? '';
      const name = path.split('/').pop() ?? path;
      const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newTab: EditorTab = {
        id,
        path,
        name,
        modified: false,
        content,
      };

      tabContentRef.current.set(id, content);
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(id);
      createEditor(content, name);
      setStatusMessage(`Opened: ${path}`);
    } catch (err) {
      setStatusMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [createEditor]);

  // Save file to VFS
  const saveFile = useCallback(async () => {
    if (!activeTabId) return;

    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab) return;

    let path = tab.path || savePath;
    if (!path) {
      setShowSaveDialog(true);
      return;
    }

    try {
      const content = tabContentRef.current.get(activeTabId) ?? editorViewRef.current?.state.doc.toString() ?? '';
      // Ensure parent directory exists
      const dir = path.substring(0, path.lastIndexOf('/')) || '/';
      if (!(await exists(dir))) {
        await mkdir(dir);
      }
      await writeFile(path, content);
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId ? { ...t, path, modified: false } : t,
        ),
      );
      setStatusMessage(`Saved: ${path}`);
    } catch (err) {
      setStatusMessage(`Save error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [activeTabId, tabs, savePath]);

  // Confirm save dialog
  const confirmSave = useCallback(() => {
    if (!savePath) {
      setStatusMessage('Please enter a file path');
      return;
    }
    setShowSaveDialog(false);
    // Update tab path
    if (activeTabId) {
      const name = savePath.split('/').pop() ?? savePath;
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, path: savePath, name } : t)),
      );
    }
    // Use setTimeout to let state update before saving
    setTimeout(() => saveFile(), 0);
  }, [activeTabId, savePath, saveFile]);

  // New file
  const newFile = useCallback(() => {
    const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newTab: EditorTab = {
      id,
      path: '',
      name: 'Untitled',
      modified: false,
      content: '',
    };
    tabContentRef.current.set(id, '');
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
    createEditor('', 'Untitled');
    setStatusMessage('New file');
  }, [createEditor]);

  // Close tab
  const closeTab = useCallback(
    (tabId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      tabContentRef.current.delete(tabId);

      setTabs((prev) => {
        const remaining = prev.filter((t) => t.id !== tabId);
        if (remaining.length === 0) {
          setActiveTabId(null);
          if (editorViewRef.current) {
            editorViewRef.current.destroy();
            editorViewRef.current = null;
          }
        } else if (activeTabId === tabId) {
          const nextTab = remaining[remaining.length - 1]!;
          setActiveTabId(nextTab.id);
          const content = tabContentRef.current.get(nextTab.id) ?? nextTab.content;
          createEditor(content, nextTab.name);
        }
        return remaining;
      });
    },
    [activeTabId, createEditor],
  );

  // List files in a directory for open dialog
  const listFiles = useCallback(async (dirPath: string) => {
    try {
      const { readdir } = await import('@/vfs/vfs');
      const entries = await readdir(dirPath || '/');
      setFileList(
        entries
          .filter((e) => e.type === 'file')
          .map((e) => {
            const prefix = dirPath === '/' ? '' : dirPath;
            return `${prefix}/${e.name}`;
          }),
      );
    } catch {
      setFileList([]);
    }
  }, []);

  // Keyboard shortcut: Ctrl+S to save, Ctrl+O to open, Ctrl+N for new
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        setShowOpenDialog(true);
        listFiles('/');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        newFile();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveFile, newFile, listFiles]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 border-b px-2 py-1"
        style={{
          backgroundColor: 'var(--os-bg-secondary)',
          borderColor: 'var(--os-border)',
        }}
      >
        <button
          onClick={newFile}
          className="rounded px-2 py-1 text-xs font-medium hover:bg-[var(--os-bg-hover)]"
          style={{ color: 'var(--os-text-primary)' }}
        >
          New
        </button>
        <button
          onClick={() => {
            setShowOpenDialog(true);
            listFiles('/');
          }}
          className="rounded px-2 py-1 text-xs font-medium hover:bg-[var(--os-bg-hover)]"
          style={{ color: 'var(--os-text-primary)' }}
        >
          Open
        </button>
        <button
          onClick={saveFile}
          className="rounded px-2 py-1 text-xs font-medium hover:bg-[var(--os-bg-hover)]"
          style={{ color: 'var(--os-text-primary)' }}
        >
          Save
        </button>
      </div>

      {/* Tabs bar */}
      {tabs.length > 0 && (
        <div
          className="flex items-center overflow-x-auto border-b"
          style={{
            backgroundColor: 'var(--os-bg-secondary)',
            borderColor: 'var(--os-border)',
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className="flex shrink-0 cursor-pointer items-center gap-1 border-r px-3 py-1.5 text-xs"
              style={{
                backgroundColor:
                  tab.id === activeTabId
                    ? 'var(--os-bg-primary)'
                    : 'transparent',
                borderColor: 'var(--os-border)',
                color:
                  tab.id === activeTabId
                    ? 'var(--os-text-primary)'
                    : 'var(--os-text-secondary)',
              }}
            >
              <span>{tab.modified ? `*${tab.name}` : tab.name}</span>
              <button
                onClick={(e) => closeTab(tab.id, e)}
                className="ml-1 rounded p-0.5 hover:bg-[var(--os-bg-hover)]"
                style={{ color: 'var(--os-text-muted)' }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Editor area */}
      <div ref={editorContainerRef} className="flex-1 overflow-hidden" />

      {/* Status bar */}
      <div
        className="flex items-center justify-between border-t px-3 py-1 text-xs"
        style={{
          backgroundColor: 'var(--os-bg-secondary)',
          borderColor: 'var(--os-border)',
          color: 'var(--os-text-muted)',
        }}
      >
        <span>{statusMessage}</span>
        {activeTab && (
          <span>
            {activeTab.path || 'Untitled'}
            {activeTab.modified ? ' (modified)' : ''}
          </span>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="w-80 rounded-lg p-4 shadow-xl"
            style={{ backgroundColor: 'var(--os-bg-secondary)' }}
          >
            <h3
              className="mb-3 text-sm font-semibold"
              style={{ color: 'var(--os-text-primary)' }}
            >
              Save As
            </h3>
            <input
              type="text"
              value={savePath}
              onChange={(e) => setSavePath(e.target.value)}
              placeholder="/home/file.txt"
              className="mb-3 w-full rounded border px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: 'var(--os-bg-primary)',
                borderColor: 'var(--os-border)',
                color: 'var(--os-text-primary)',
              }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && confirmSave()}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="rounded px-3 py-1.5 text-xs hover:bg-[var(--os-bg-hover)]"
                style={{ color: 'var(--os-text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="rounded bg-[var(--os-accent)] px-3 py-1.5 text-xs text-white hover:bg-[var(--os-accent-hover)]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open Dialog */}
      {showOpenDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="w-96 rounded-lg p-4 shadow-xl"
            style={{ backgroundColor: 'var(--os-bg-secondary)' }}
          >
            <h3
              className="mb-3 text-sm font-semibold"
              style={{ color: 'var(--os-text-primary)' }}
            >
              Open File
            </h3>
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={openPath}
                onChange={(e) => setOpenPath(e.target.value)}
                placeholder="/path/to/file.txt"
                className="flex-1 rounded border px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--os-bg-primary)',
                  borderColor: 'var(--os-border)',
                  color: 'var(--os-text-primary)',
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && openPath.trim()) {
                    openFile(openPath.trim());
                    setShowOpenDialog(false);
                    setOpenPath('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (openPath.trim()) {
                    openFile(openPath.trim());
                    setShowOpenDialog(false);
                    setOpenPath('');
                  }
                }}
                className="rounded bg-[var(--os-accent)] px-3 py-2 text-xs text-white hover:bg-[var(--os-accent-hover)]"
              >
                Open
              </button>
            </div>
            {/* File browser */}
            {fileList.length > 0 && (
              <div
                className="max-h-48 overflow-y-auto rounded border"
                style={{
                  borderColor: 'var(--os-border)',
                  backgroundColor: 'var(--os-bg-primary)',
                }}
              >
                {fileList.map((file) => (
                  <button
                    key={file}
                    onClick={() => {
                      openFile(file);
                      setShowOpenDialog(false);
                      setOpenPath('');
                    }}
                    className="block w-full px-3 py-1 text-left text-xs hover:bg-[var(--os-bg-hover)]"
                    style={{ color: 'var(--os-text-primary)' }}
                  >
                    {file}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setShowOpenDialog(false);
                  setOpenPath('');
                  setFileList([]);
                }}
                className="rounded px-3 py-1.5 text-xs hover:bg-[var(--os-bg-hover)]"
                style={{ color: 'var(--os-text-secondary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
