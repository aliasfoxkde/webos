export interface FileNode {
  id: string;
  name: string;
  parentId: string | null;
  type: 'file' | 'folder';
  mimeType: string;
  size: number;
  content: string | ArrayBuffer | null;
  createdAt: number;
  updatedAt: number;
  version: number;
  isHidden: boolean;
  isSystem: boolean;
}

export type VFSEventType = 'create' | 'delete' | 'update' | 'move' | 'copy';

export interface VFSEvent {
  type: VFSEventType;
  path: string;
  oldPath?: string;
  timestamp: number;
}

export interface VFSConfig {
  defaultHomePath: string;
}

export interface SearchResult {
  file: FileNode;
  path: string;
  match: 'name' | 'content' | 'extension';
}
