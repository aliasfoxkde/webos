import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/vfs/vfs', () => ({
  readFile: vi.fn().mockResolvedValue({ content: '{"blocks":[]}' }),
  writeFile: vi.fn().mockResolvedValue({}),
  mkdir: vi.fn().mockResolvedValue({}),
  readdir: vi.fn().mockResolvedValue([]),
  exists: vi.fn().mockResolvedValue(true),
}));

import { Notes } from './Notes';

describe('Notes', () => {
  it('renders without crashing', () => {
    const { container } = render(<Notes />);
    expect(container).toBeDefined();
  });

  it('renders sidebar with Notes header', () => {
    render(<Notes />);
    expect(screen.getByText('Notes')).toBeDefined();
  });

  it('renders new note button', () => {
    render(<Notes />);
    const newBtn = screen.getByTitle('New Note');
    expect(newBtn).toBeDefined();
  });

  it('renders search input', () => {
    render(<Notes />);
    const searchInput = screen.getByPlaceholderText('Search notes...');
    expect(searchInput).toBeDefined();
  });

  it('renders empty state message', () => {
    render(<Notes />);
    expect(screen.getByText('No notes yet')).toBeDefined();
  });
});
