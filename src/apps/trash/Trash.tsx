import { useState, useEffect, useCallback } from 'react';
import { readdir, rm, mv, mkdir, exists } from '@/vfs/vfs';
import type { FileNode } from '@/vfs/types';

const TRASH_DIR = '/trash';
const RESTORE_DIR = '/home/Desktop';

export function Trash() {
  const [items, setItems] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      const files = await readdir(TRASH_DIR);
      setItems(files);
    } catch (err) {
      console.error('Failed to load trash:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const ensureRestoreDir = async () => {
    if (!(await exists(RESTORE_DIR))) {
      await mkdir(RESTORE_DIR);
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('Permanently delete all items in Trash?')) return;
    try {
      for (const item of items) {
        await rm(`${TRASH_DIR}/${item.name}`);
      }
      await loadItems();
    } catch (err) {
      console.error('Failed to empty trash:', err);
    }
  };

  const handleRestoreAll = async () => {
    try {
      await ensureRestoreDir();
      for (const item of items) {
        await mv(`${TRASH_DIR}/${item.name}`, `${RESTORE_DIR}/${item.name}`);
      }
      await loadItems();
    } catch (err) {
      console.error('Failed to restore all items:', err);
    }
  };

  const handleRestore = async (item: FileNode) => {
    try {
      await ensureRestoreDir();
      await mv(`${TRASH_DIR}/${item.name}`, `${RESTORE_DIR}/${item.name}`);
      await loadItems();
    } catch (err) {
      console.error(`Failed to restore ${item.name}:`, err);
    }
  };

  const handleDelete = async (item: FileNode) => {
    if (!confirm(`Permanently delete "${item.name}"?`)) return;
    try {
      await rm(`${TRASH_DIR}/${item.name}`);
      await loadItems();
    } catch (err) {
      console.error(`Failed to delete ${item.name}:`, err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--os-bg-primary)] text-[var(--os-text-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--os-border)] bg-[var(--os-bg-secondary)] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#x1F5D1;&#xFE0F;</span>
          <h1 className="text-sm font-semibold">Trash</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 text-xs rounded border border-[var(--os-border)] text-[var(--os-text-secondary)] hover:bg-[var(--os-bg-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleRestoreAll}
            disabled={items.length === 0}
          >
            Restore All
          </button>
          <button
            className="px-3 py-1 text-xs rounded border border-[var(--os-error)]/30 text-[var(--os-error)] hover:bg-[var(--os-error)]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleEmptyTrash}
            disabled={items.length === 0}
          >
            Empty Trash
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[var(--os-text-muted)] text-sm">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--os-text-muted)]">
            <div className="text-center">
              <p className="text-4xl mb-2">&#x1F5D1;&#xFE0F;</p>
              <p className="text-sm">Trash is empty</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--os-border)]">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--os-bg-hover)] transition-colors group"
              >
                <span className="text-base shrink-0">
                  {item.type === 'folder' ? '\u{1F4C1}' : '\u{1F4C4}'}
                </span>
                <span className="flex-1 text-sm truncate">{item.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    className="px-2 py-1 text-xs rounded border border-[var(--os-border)] text-[var(--os-text-secondary)] hover:bg-[var(--os-bg-secondary)] transition-colors"
                    onClick={() => handleRestore(item)}
                  >
                    Restore
                  </button>
                  <button
                    className="px-2 py-1 text-xs rounded border border-[var(--os-error)]/30 text-[var(--os-error)] hover:bg-[var(--os-error)]/10 transition-colors"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-1.5 border-t border-[var(--os-border)] bg-[var(--os-bg-secondary)] text-[var(--os-text-muted)] text-xs shrink-0">
        {items.length} {items.length === 1 ? 'item' : 'items'} in Trash
      </div>
    </div>
  );
}
