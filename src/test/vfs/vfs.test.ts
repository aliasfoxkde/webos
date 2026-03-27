import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/vfs/db';
import {
  mkdir,
  writeFile,
  readFile,
  readdir,
  stat,
  rm,
  mv,
  cp,
  search,
  exists,
  clear,
  getPath,
} from '@/vfs/vfs';

describe('Virtual File System', () => {
  beforeEach(async () => {
    await clear();
  });

  afterEach(async () => {
    await clear();
  });

  describe('mkdir', () => {
    it('should create a directory', async () => {
      const node = await mkdir('/test');
      expect(node.name).toBe('test');
      expect(node.type).toBe('folder');
    });

    it('should create nested directories', async () => {
      await mkdir('/a');
      await mkdir('/a/b');
      await mkdir('/a/b/c');
      expect(await exists('/a/b/c')).toBe(true);
    });

    it('should not create duplicate directories', async () => {
      const n1 = await mkdir('/test');
      const n2 = await mkdir('/test');
      expect(n1.id).toBe(n2.id);
    });
  });

  describe('writeFile / readFile', () => {
    it('should write and read a file', async () => {
      await mkdir('/home');
      await writeFile('/home/test.txt', 'Hello, WebOS!');
      const file = await readFile('/home/test.txt');
      expect(file).toBeDefined();
      expect(file!.content).toBe('Hello, WebOS!');
      expect(file!.mimeType).toBe('text/plain');
    });

    it('should auto-detect MIME type', async () => {
      await mkdir('/home');
      await writeFile('/home/image.png', new ArrayBuffer(10));
      const file = await readFile('/home/image.png');
      expect(file!.mimeType).toBe('image/png');
    });

    it('should overwrite existing file', async () => {
      await mkdir('/home');
      await writeFile('/home/test.txt', 'v1');
      await writeFile('/home/test.txt', 'v2');
      const file = await readFile('/home/test.txt');
      expect(file!.content).toBe('v2');
      expect(file!.version).toBe(2);
    });

    it('should mark dotfiles as hidden', async () => {
      await mkdir('/home');
      const file = await writeFile('/home/.hidden', 'secret');
      expect(file.isHidden).toBe(true);
    });
  });

  describe('readdir', () => {
    it('should list directory contents', async () => {
      await mkdir('/test');
      await writeFile('/test/a.txt', 'a');
      await writeFile('/test/b.txt', 'b');
      const contents = await readdir('/test');
      expect(contents).toHaveLength(2);
    });

    it('should return empty for empty directory', async () => {
      await mkdir('/empty');
      const contents = await readdir('/empty');
      expect(contents).toHaveLength(0);
    });

    it('should return empty for non-existent directory', async () => {
      const contents = await readdir('/nonexistent');
      expect(contents).toHaveLength(0);
    });
  });

  describe('rm', () => {
    it('should delete a file', async () => {
      await mkdir('/test');
      await writeFile('/test/file.txt', 'delete me');
      await rm('/test/file.txt');
      expect(await exists('/test/file.txt')).toBe(false);
    });

    it('should delete a directory and its contents', async () => {
      await mkdir('/parent');
      await writeFile('/parent/child1.txt', '1');
      await writeFile('/parent/child2.txt', '2');
      await rm('/parent');
      expect(await exists('/parent')).toBe(false);
      expect(await exists('/parent/child1.txt')).toBe(false);
      expect(await exists('/parent/child2.txt')).toBe(false);
    });
  });

  describe('mv', () => {
    it('should rename a file', async () => {
      await mkdir('/test');
      await writeFile('/test/old.txt', 'content');
      await mv('/test/old.txt', '/test/new.txt');
      expect(await exists('/test/old.txt')).toBe(false);
      expect(await readFile('/test/new.txt')).toBeDefined();
    });

    it('should move a file between directories', async () => {
      await mkdir('/dir1');
      await mkdir('/dir2');
      await writeFile('/dir1/file.txt', 'move me');
      await mv('/dir1/file.txt', '/dir2/file.txt');
      expect(await exists('/dir1/file.txt')).toBe(false);
      expect(await readFile('/dir2/file.txt')).toBeDefined();
    });
  });

  describe('cp', () => {
    it('should copy a file', async () => {
      await mkdir('/test');
      await writeFile('/test/original.txt', 'copy me');
      await cp('/test/original.txt', '/test/copy.txt');
      const orig = await readFile('/test/original.txt');
      const copy = await readFile('/test/copy.txt');
      expect(orig!.content).toBe(copy!.content);
      expect(orig!.id).not.toBe(copy!.id);
    });
  });

  describe('search', () => {
    it('should find files by name', async () => {
      await mkdir('/docs');
      await writeFile('/docs/readme.md', '# Readme');
      await writeFile('/docs/changelog.md', '# Changelog');
      await writeFile('/docs/index.html', '<html></html>');
      const results = await search('.md', '/docs');
      expect(results).toHaveLength(2);
    });
  });

  describe('exists', () => {
    it('should return true for existing files', async () => {
      await mkdir('/test');
      await writeFile('/test/file.txt', 'x');
      expect(await exists('/test/file.txt')).toBe(true);
    });

    it('should return false for non-existent files', async () => {
      expect(await exists('/nonexistent')).toBe(false);
    });
  });

  describe('getPath', () => {
    it('should return the full path of a node', async () => {
      await mkdir('/home');
      await mkdir('/home/docs');
      const file = await writeFile('/home/docs/test.txt', 'x');
      const path = await getPath(file.id);
      expect(path).toBe('/home/docs/test.txt');
    });
  });

  describe('stat', () => {
    it('should return node metadata', async () => {
      await mkdir('/test');
      const node = await stat('/test');
      expect(node).toBeDefined();
      expect(node!.type).toBe('folder');
    });

    it('should return undefined for non-existent path', async () => {
      expect(await stat('/nonexistent')).toBeUndefined();
    });
  });
});
