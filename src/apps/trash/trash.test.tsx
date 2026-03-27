import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Trash } from './Trash';

// Mock VFS functions
vi.mock('@/vfs/vfs', () => ({
  readdir: vi.fn().mockResolvedValue([]),
  rm: vi.fn().mockResolvedValue(undefined),
  mv: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue({} as any),
  exists: vi.fn().mockResolvedValue(true),
}));

describe('Trash', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Trash header', async () => {
    render(<Trash />);
    // Wait for loading to finish
    const header = await screen.findByText('Trash');
    expect(header).toBeDefined();
  });

  it('renders Empty Trash button', async () => {
    render(<Trash />);
    const btn = await screen.findByText('Empty Trash');
    expect(btn).toBeDefined();
  });

  it('renders Restore All button', async () => {
    render(<Trash />);
    const btn = await screen.findByText('Restore All');
    expect(btn).toBeDefined();
  });

  it('shows empty state when trash has no items', async () => {
    render(<Trash />);
    const empty = await screen.findByText('Trash is empty');
    expect(empty).toBeDefined();
  });

  it('shows item count in status bar', async () => {
    render(<Trash />);
    const status = await screen.findByText('0 items in Trash');
    expect(status).toBeDefined();
  });
});
