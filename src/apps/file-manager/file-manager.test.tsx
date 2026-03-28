import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('@/apps/file-manager/use-file-operations', () => ({
  useFileOperations: () => ({
    loading: false,
    error: null,
    createFolder: vi.fn(),
    createFile: vi.fn(),
    deleteItem: vi.fn(),
    moveItem: vi.fn(),
    copyItem: vi.fn(),
    searchFiles: vi.fn(),
    listDir: vi.fn(),
    getStat: vi.fn(),
    renameItem: vi.fn(),
    clearError: vi.fn(),
  }),
}));

vi.mock('@/vfs/vfs', () => ({
  readdir: vi.fn().mockResolvedValue([
    { id: '1', name: 'file.txt', type: 'file', isHidden: false },
    { id: '2', name: 'folder', type: 'folder', isHidden: false },
  ]),
}));

vi.mock('@/kernel/kernel', () => ({
  kernel: { apps: { findByExtension: vi.fn().mockReturnValue([]), get: vi.fn() } },
}));

vi.mock('@/wm/window-store', () => ({
  useWindowStore: (fn: (s: Record<string, unknown>) => unknown) => fn({ open: vi.fn() }),
}));

vi.mock('@/stores/kernel-store', () => ({
  useKernelStore: (fn: (s: Record<string, unknown>) => unknown) => fn({ launchApp: vi.fn() }),
}));

import { FileManager } from './FileManager';

describe('FileManager', () => {
  it('renders without crashing', () => {
    const { container } = render(<FileManager />);
    expect(container).toBeDefined();
  });
});
