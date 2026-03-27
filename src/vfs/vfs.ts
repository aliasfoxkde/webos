import { db } from './db';
import { getMimeType } from './mime';
import { eventBus } from '@/kernel/event-bus';
import type { FileNode, VFSEvent } from './types';
import { enqueueSync } from './sync-r2';

let idCounter = 0;

function generateId(): string {
  return `file-${++idCounter}-${Date.now().toString(36)}`;
}

function now(): number {
  return Date.now();
}

/** Find a single node matching criteria using filter (supports null parentId). */
async function findOne(
  predicate: (node: FileNode) => boolean,
): Promise<FileNode | undefined> {
  return db.files.filter(predicate).first();
}

/** Find all nodes matching criteria using filter. */
async function findAll(
  predicate: (node: FileNode) => boolean,
): Promise<FileNode[]> {
  return db.files.filter(predicate).toArray();
}

/**
 * Resolve a path to get the parentId and name.
 */
async function resolvePath(path: string): Promise<{ parentId: string | null; name: string }> {
  const cleanPath = path.replace(/\/+$/, '');
  if (cleanPath === '/' || cleanPath === '') {
    return { parentId: null, name: '/' };
  }

  const parts = cleanPath.split('/').filter(Boolean);
  const name = parts.pop()!;

  if (parts.length === 0) {
    return { parentId: null, name };
  }

  let parentId: string | null = null;
  for (const part of parts) {
    const parent = await findOne(
      (n) => n.parentId === parentId && n.name === part && n.type === 'folder',
    );
    if (!parent) {
      throw new Error(`Path not found: ${parts.join('/')}/${name}`);
    }
    parentId = parent.id;
  }

  return { parentId, name };
}

/**
 * Get the full path of a file node.
 */
export async function getPath(nodeId: string): Promise<string> {
  const parts: string[] = [];
  let current = await db.files.get(nodeId);
  while (current) {
    parts.unshift(current.name);
    if (current.parentId === null) break;
    current = await db.files.get(current.parentId);
  }
  return '/' + parts.join('/');
}

/**
 * Get a file node by ID.
 */
export async function get(id: string): Promise<FileNode | undefined> {
  return db.files.get(id);
}

/**
 * Get a node by path.
 */
export async function stat(path: string): Promise<FileNode | undefined> {
  const { parentId, name } = await resolvePath(path);
  if (name === '/') {
    return findOne((n) => n.parentId === null && n.type === 'folder');
  }
  return findOne((n) => n.parentId === parentId && n.name === name);
}

/**
 * List directory contents.
 */
export async function readdir(dirPath: string): Promise<FileNode[]> {
  const { parentId, name } = await resolvePath(dirPath);
  if (name === '/') {
    return findAll((n) => n.parentId === null);
  }
  const dir = await findOne(
    (n) => n.parentId === parentId && n.name === name && n.type === 'folder',
  );
  if (!dir) return [];
  return findAll((n) => n.parentId === dir.id);
}

/**
 * Read file content.
 */
export async function readFile(path: string): Promise<FileNode | undefined> {
  const node = await stat(path);
  if (!node || node.type !== 'file') return undefined;
  return node;
}

/**
 * Write file content.
 */
export async function writeFile(
  path: string,
  content: string | ArrayBuffer,
  mimeType?: string,
): Promise<FileNode> {
  const { parentId, name } = await resolvePath(path);
  const existing = await findOne(
    (n) => n.parentId === parentId && n.name === name && n.type === 'file',
  );

  if (existing) {
    const updated: FileNode = {
      ...existing,
      content,
      mimeType: mimeType ?? getMimeType(name),
      size: typeof content === 'string' ? content.length : (content as ArrayBuffer).byteLength,
      updatedAt: now(),
      version: existing.version + 1,
    };
    await db.files.put(updated);
    emitVFS('update', path);
    enqueueSync('upload', path);
    return updated;
  }

  const node: FileNode = {
    id: generateId(),
    name,
    parentId,
    type: 'file',
    mimeType: mimeType ?? getMimeType(name),
    size: typeof content === 'string' ? content.length : (content as ArrayBuffer).byteLength,
    content,
    createdAt: now(),
    updatedAt: now(),
    version: 1,
    isHidden: name.startsWith('.'),
    isSystem: false,
  };
  await db.files.add(node);
  emitVFS('create', path);
  enqueueSync('upload', path);
  return node;
}

/**
 * Create a directory.
 */
export async function mkdir(path: string): Promise<FileNode> {
  const { parentId, name } = await resolvePath(path);

  const existing = await findOne(
    (n) => n.parentId === parentId && n.name === name && n.type === 'folder',
  );
  if (existing) return existing;

  const node: FileNode = {
    id: generateId(),
    name,
    parentId,
    type: 'folder',
    mimeType: 'inode/directory',
    size: 0,
    content: null,
    createdAt: now(),
    updatedAt: now(),
    version: 1,
    isHidden: name.startsWith('.'),
    isSystem: false,
  };
  await db.files.add(node);
  emitVFS('create', path);
  return node;
}

/**
 * Remove a file or directory.
 */
export async function rm(path: string): Promise<void> {
  const node = await stat(path);
  if (!node) return;

  if (node.type === 'folder') {
    const children = await findAll((n) => n.parentId === node.id);
    for (const child of children) {
      await rmById(child.id);
    }
  }

  await db.files.delete(node.id);
  emitVFS('delete', path);
  if (node.type === 'file') {
    enqueueSync('delete', path);
  }
}

/** Remove a node by ID (internal, used by recursive rm). */
async function rmById(id: string): Promise<void> {
  const node = await db.files.get(id);
  if (!node) return;

  if (node.type === 'folder') {
    const children = await findAll((n) => n.parentId === node.id);
    for (const child of children) {
      await rmById(child.id);
    }
  }

  await db.files.delete(id);
}

/**
 * Move/rename a file or directory.
 */
export async function mv(fromPath: string, toPath: string): Promise<void> {
  const node = await stat(fromPath);
  if (!node) throw new Error(`Not found: ${fromPath}`);

  const { parentId: newParentId, name: newName } = await resolvePath(toPath);
  const updated: FileNode = {
    ...node,
    name: newName,
    parentId: newParentId,
    updatedAt: now(),
    version: node.version + 1,
  };
  await db.files.put(updated);
  emitVFS('move', toPath, fromPath);
}

/**
 * Copy a file.
 */
export async function cp(fromPath: string, toPath: string): Promise<FileNode> {
  const node = await stat(fromPath);
  if (!node) throw new Error(`Not found: ${fromPath}`);
  if (node.type === 'folder') throw new Error('Cannot copy directories');

  const { parentId, name } = await resolvePath(toPath);
  const copy: FileNode = {
    ...node,
    id: generateId(),
    name,
    parentId,
    createdAt: now(),
    updatedAt: now(),
    version: 1,
  };
  await db.files.add(copy);
  emitVFS('copy', toPath);
  return copy;
}

/**
 * Search files by name pattern.
 */
export async function search(query: string, dirPath?: string): Promise<FileNode[]> {
  const lowerQuery = query.toLowerCase();

  if (dirPath) {
    const dir = await stat(dirPath);
    if (dir && dir.type === 'folder') {
      return db.files
        .where('parentId')
        .equals(dir.id)
        .filter((n) => n.name.toLowerCase().includes(lowerQuery))
        .toArray();
    }
  }

  return db.files
    .filter((n) => n.name.toLowerCase().includes(lowerQuery))
    .toArray();
}

/**
 * Check if a path exists.
 */
export async function exists(path: string): Promise<boolean> {
  try {
    const node = await stat(path);
    return node !== undefined;
  } catch {
    return false;
  }
}

/**
 * Get all files in the VFS.
 */
export async function getAllFiles(): Promise<FileNode[]> {
  return db.files.toArray();
}

/**
 * Clear all VFS data (for testing).
 */
export async function clear(): Promise<void> {
  await db.files.clear();
}

function emitVFS(type: VFSEvent['type'], path: string, oldPath?: string): void {
  const event: VFSEvent = { type, path, oldPath, timestamp: now() };
  const kernelType = `file:${type}` as const;
  const payload: Record<string, string> = { path };
  if (oldPath) payload.from = oldPath;
  eventBus.emit(kernelType, payload as never);
}
