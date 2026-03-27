/**
 * Conflict resolver for sync conflicts.
 * Uses "last write wins" strategy with optional user resolution.
 */

export interface SyncConflict {
  localPath: string;
  localModified: number;
  remoteModified: number;
  localSize: number;
  remoteSize: number;
  resolution?: 'local' | 'remote' | 'keep-both';
}

type ConflictStrategy = 'last-write-wins' | 'local-wins' | 'remote-wins' | 'ask';

/**
 * Resolve a sync conflict using the given strategy.
 */
export function resolveConflict(conflict: SyncConflict, strategy: ConflictStrategy): 'local' | 'remote' {
  switch (strategy) {
    case 'last-write-wins':
      return conflict.localModified >= conflict.remoteModified ? 'local' : 'remote';
    case 'local-wins':
      return 'local';
    case 'remote-wins':
      return 'remote';
    case 'ask':
      // Default to local when asking (UI will prompt)
      return conflict.localModified >= conflict.remoteModified ? 'local' : 'remote';
  }
}

/**
 * Detect conflicts between local and remote files.
 */
export function detectConflicts(
  localFiles: Array<{ path: string; modified: number; size: number }>,
  remoteFiles: Array<{ path: string; modified: number; size: number }>,
): SyncConflict[] {
  const conflicts: SyncConflict[] = [];

  const remoteMap = new Map(remoteFiles.map((f) => [f.path, f]));

  for (const local of localFiles) {
    const remote = remoteMap.get(local.path);
    if (remote && (local.modified !== remote.modified || local.size !== remote.size)) {
      conflicts.push({
        localPath: local.path,
        localModified: local.modified,
        remoteModified: remote.modified,
        localSize: local.size,
        remoteSize: remote.size,
      });
    }
  }

  return conflicts;
}
