import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock API client
vi.mock('@/lib/api-client', () => ({
  filesApi: {
    list: vi.fn().mockResolvedValue({ ok: true, files: [] }),
    upload: vi.fn().mockResolvedValue({ ok: true }),
    download: vi.fn().mockResolvedValue({ ok: true, arrayBuffer: () => new ArrayBuffer(0) }),
    delete: vi.fn().mockResolvedValue({ ok: true }),
    metadata: vi.fn().mockResolvedValue({ ok: true, metadata: { size: 0, type: 'text/plain', lastModified: '' } }),
  },
}));

// Mock VFS
vi.mock('@/vfs/vfs', () => ({
  stat: vi.fn().mockResolvedValue(null),
  getAllFiles: vi.fn().mockResolvedValue([]),
  writeFile: vi.fn().mockResolvedValue({}),
  mkdir: vi.fn().mockResolvedValue({}),
}));

import { enqueueSync, getSyncStatus, clearSyncState, processSyncQueue, fullSync } from '@/vfs/sync-r2';
import { resolveConflict, detectConflicts } from '@/vfs/sync-queue';
import type { SyncConflict } from '@/vfs/sync-queue';

describe('sync-r2', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('enqueueSync', () => {
    it('adds upload item to queue', () => {
      enqueueSync('upload', '/home/test.txt');
      const status = getSyncStatus();
      expect(status.queueLength).toBe(1);
    });

    it('deduplicates entries for same path', () => {
      enqueueSync('upload', '/home/test.txt');
      enqueueSync('upload', '/home/test.txt');
      const status = getSyncStatus();
      expect(status.queueLength).toBe(1);
    });

    it('allows both upload and delete for different paths', () => {
      enqueueSync('upload', '/home/test.txt');
      enqueueSync('delete', '/home/old.txt');
      const status = getSyncStatus();
      expect(status.queueLength).toBe(2);
    });

    it('replaces action for same path', () => {
      enqueueSync('upload', '/home/test.txt');
      enqueueSync('delete', '/home/test.txt');
      const status = getSyncStatus();
      expect(status.queueLength).toBe(1);
    });
  });

  describe('clearSyncState', () => {
    it('clears sync queue and state', () => {
      enqueueSync('upload', '/home/test.txt');
      clearSyncState();
      const status = getSyncStatus();
      expect(status.queueLength).toBe(0);
      expect(status.lastSyncAt).toBe(0);
    });
  });

  describe('processSyncQueue', () => {
    it('processes upload items', async () => {
      enqueueSync('upload', '/home/test.txt');
      await processSyncQueue('test-token');
      const status = getSyncStatus();
      expect(status.queueLength).toBe(0);
    });

    it('processes delete items', async () => {
      enqueueSync('delete', '/home/test.txt');
      await processSyncQueue('test-token');
      const status = getSyncStatus();
      expect(status.queueLength).toBe(0);
    });

    it('handles empty queue', async () => {
      await processSyncQueue('test-token');
      // Should not throw
    });
  });

  describe('fullSync', () => {
    it('returns sync result', async () => {
      const result = await fullSync('test-token', 'user-1');
      expect(result).toHaveProperty('uploaded');
      expect(result).toHaveProperty('downloaded');
      expect(result).toHaveProperty('conflicts');
    });
  });
});

describe('sync-queue', () => {
  describe('resolveConflict', () => {
    const conflict: SyncConflict = {
      localPath: '/home/test.txt',
      localModified: Date.now() - 1000,
      remoteModified: Date.now() - 5000,
      localSize: 100,
      remoteSize: 90,
    };

    it('uses last-write-wins strategy', () => {
      expect(resolveConflict(conflict, 'last-write-wins')).toBe('local');
    });

    it('uses local-wins strategy', () => {
      expect(resolveConflict(conflict, 'local-wins')).toBe('local');
    });

    it('uses remote-wins strategy', () => {
      expect(resolveConflict(conflict, 'remote-wins')).toBe('remote');
    });

    it('uses ask strategy', () => {
      expect(resolveConflict(conflict, 'ask')).toBe('local');
    });
  });

  describe('detectConflicts', () => {
    it('detects no conflicts when files match', () => {
      const local = [{ path: '/test.txt', modified: 1000, size: 50 }];
      const remote = [{ path: '/test.txt', modified: 1000, size: 50 }];
      expect(detectConflicts(local, remote)).toHaveLength(0);
    });

    it('detects conflicts when files differ', () => {
      const local = [{ path: '/test.txt', modified: 2000, size: 60 }];
      const remote = [{ path: '/test.txt', modified: 1000, size: 50 }];
      const conflicts = detectConflicts(local, remote);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].localPath).toBe('/test.txt');
    });

    it('ignores files only in local or only in remote', () => {
      const local = [{ path: '/local-only.txt', modified: 1000, size: 50 }];
      const remote = [{ path: '/remote-only.txt', modified: 1000, size: 50 }];
      expect(detectConflicts(local, remote)).toHaveLength(0);
    });
  });
});
