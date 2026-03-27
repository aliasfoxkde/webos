import Dexie, { type Table } from 'dexie';
import type { FileNode } from './types';

/**
 * IndexedDB database for the virtual file system.
 */
class VFSDatabase extends Dexie {
  files!: Table<FileNode, string>;

  constructor() {
    super('webos-vfs');
    this.version(1).stores({
      files: 'id, parentId, name, type, mimeType, createdAt, updatedAt',
    });
  }
}

export const db = new VFSDatabase();
