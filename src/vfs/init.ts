import { mkdir } from './vfs';

/**
 * Initialize default directory structure.
 * Called on first boot.
 */
export async function initDefaultDirectories(): Promise<void> {
  const dirs = [
    '/home',
    '/home/Desktop',
    '/home/Documents',
    '/home/Documents/Notes',
    '/home/Downloads',
    '/home/Pictures',
    '/home/Music',
    '/home/Videos',
    '/system',
    '/trash',
  ];

  for (const dir of dirs) {
    await mkdir(dir);
  }
}
