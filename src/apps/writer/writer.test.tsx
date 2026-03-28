import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/vfs/vfs', () => ({
  readFile: vi.fn().mockResolvedValue({ content: '{"blocks":[]}' }),
  writeFile: vi.fn().mockResolvedValue({}),
  mkdir: vi.fn().mockResolvedValue({}),
  exists: vi.fn().mockResolvedValue(true),
}));

import { Writer } from './Writer';

describe('Writer', () => {
  it('renders without crashing', () => {
    const { container } = render(<Writer />);
    expect(container).toBeDefined();
  });

  it('renders New and Save buttons', () => {
    render(<Writer />);
    expect(screen.getByText('New')).toBeDefined();
    expect(screen.getByText('Save')).toBeDefined();
  });

  it('renders formatting toolbar buttons', () => {
    render(<Writer />);
    expect(screen.getByTitle('Bold (Ctrl+B)')).toBeDefined();
    expect(screen.getByTitle('Italic (Ctrl+I)')).toBeDefined();
    expect(screen.getByTitle('Underline (Ctrl+U)')).toBeDefined();
  });
});
