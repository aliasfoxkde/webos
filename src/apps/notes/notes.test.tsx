import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

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
});
