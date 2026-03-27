/**
 * R2 cloud sync - bidirectional sync between IndexedDB (VFS) and Cloudflare R2.
 */
import { db } from './db';
import { getAllFiles, stat } from './vfs';
import { filesApi } from '@/lib/api-client';
import type { FileNode } from './types';

interface SyncState {
  lastSyncAt: number;
  userId: string;
  syncQueue: SyncQueueItem[];
}

interface SyncQueueItem {
  action: 'upload' | 'delete';
  path: string;
  timestamp: number;
  retryCount: number;
}

const SYNC_STATE_KEY = 'webos-sync-state';
const SYNC_QUEUE_KEY = 'webos-sync-queue';
const MAX_RETRIES = 3;

function loadSyncState(): SyncState {
  try {
    const data = localStorage.getItem(SYNC_STATE_KEY);
    return data ? JSON.parse(data) : { lastSyncAt: 0, userId: '', syncQueue: [] };
  } catch {
    return { lastSyncAt: 0, userId: '', syncQueue: [] };
  }
}

function saveSyncState(state: SyncState): void {
  localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(state));
}

function loadSyncQueue(): SyncQueueItem[] {
  try {
    const data = localStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSyncQueue(queue: SyncQueueItem[]): void {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Enqueue a file for sync.
 */
export function enqueueSync(action: 'upload' | 'delete', path: string): void {
  const queue = loadSyncQueue();
  const existingIdx = queue.findIndex((item) => item.path === path);
  const item: SyncQueueItem = { action, path, timestamp: Date.now(), retryCount: 0 };

  if (existingIdx >= 0) {
    queue[existingIdx] = item;
  } else {
    queue.push(item);
  }

  saveSyncQueue(queue);
}

/**
 * Process the sync queue - upload/delete files to/from R2.
 */
export async function processSyncQueue(token: string): Promise<void> {
  let queue = loadSyncQueue();

  for (const item of queue) {
    try {
      if (item.action === 'upload') {
        const node = await stat(item.path);
        if (node && node.type === 'file' && node.content) {
          let content: ArrayBuffer;
          if (typeof node.content === 'string') {
            content = new TextEncoder().encode(node.content).buffer as ArrayBuffer;
          } else {
            content = node.content as ArrayBuffer;
          }

          await filesApi.upload(token, item.path, content, node.mimeType);
        }
      } else if (item.action === 'delete') {
        await filesApi.delete(token, item.path);
      }

      queue = queue.filter((q) => q !== item);
    } catch {
      item.retryCount++;
      if (item.retryCount >= MAX_RETRIES) {
        queue = queue.filter((q) => q !== item);
      }
    }
  }

  saveSyncQueue(queue);
}

/**
 * Build full path from a FileNode (async).
 */
async function buildPath(node: FileNode): Promise<string> {
  const parts: string[] = [];
  let current: FileNode | undefined = node;

  while (current) {
    parts.unshift(current.name);
    if (current.parentId === null) break;
    current = await db.files.get(current.parentId);
  }

  return parts.join('/');
}

/**
 * Full sync - download all remote files and merge with local.
 */
export async function fullSync(token: string, userId: string): Promise<{
  uploaded: number;
  downloaded: number;
  conflicts: number;
}> {
  let uploaded = 0;
  let downloaded = 0;
  let conflicts = 0;

  try {
    const result = await filesApi.list(token);
    const remoteFiles = result.files ?? [];

    const localFiles = await getAllFiles();

    // Build local path map
    const localPaths = new Map<string, FileNode>();
    for (const local of localFiles) {
      const localPath = await buildPath(local);
      localPaths.set(localPath, local);
    }

    // Download files that exist remotely but not locally
    for (const remote of remoteFiles) {
      if (remote.key.endsWith('/')) continue;

      if (!localPaths.has(remote.key)) {
        try {
          const response = await filesApi.download(token, remote.key);
          if (response.ok) {
            const content = await response.arrayBuffer();
            const { writeFile, mkdir } = await import('./vfs');
            const parts = remote.key.split('/');
            if (parts.length > 1) {
              const dirPath = '/' + parts.slice(0, -1).join('/');
              if (!(await stat(dirPath))) {
                await mkdir(dirPath);
              }
            }
            await writeFile('/' + remote.key, content);
            downloaded++;
          }
        } catch {
          // Skip failed downloads
        }
      }
    }

    // Upload local files that don't exist remotely
    const remoteKeys = new Set(remoteFiles.map((r) => r.key));
    for (const [localPath, local] of localPaths) {
      if (local.type === 'folder') continue;

      if (!remoteKeys.has(localPath) && local.content) {
        try {
          let content: ArrayBuffer;
          if (typeof local.content === 'string') {
            content = new TextEncoder().encode(local.content).buffer as ArrayBuffer;
          } else {
            content = local.content as ArrayBuffer;
          }

          await filesApi.upload(token, localPath, content, local.mimeType);
          uploaded++;
        } catch {
          // Skip failed uploads
        }
      }
    }
  } catch {
    // Sync failed - will retry later
  }

  const state = loadSyncState();
  state.lastSyncAt = Date.now();
  state.userId = userId;
  saveSyncState(state);

  return { uploaded, downloaded, conflicts };
}

/**
 * Get sync status.
 */
export function getSyncStatus(): { lastSyncAt: number; queueLength: number; userId: string } {
  const state = loadSyncState();
  const queue = loadSyncQueue();
  return {
    lastSyncAt: state.lastSyncAt,
    queueLength: queue.length,
    userId: state.userId,
  };
}

/**
 * Clear sync state (on logout).
 */
export function clearSyncState(): void {
  localStorage.removeItem(SYNC_STATE_KEY);
  localStorage.removeItem(SYNC_QUEUE_KEY);
}
