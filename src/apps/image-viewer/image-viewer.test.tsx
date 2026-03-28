import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('@/vfs/vfs', () => ({
  readFile: vi.fn().mockResolvedValue(null),
  stat: vi.fn().mockResolvedValue(null),
}));

import { ImageViewer } from './ImageViewer';

describe('ImageViewer', () => {
  it('renders without crashing', () => {
    const { container } = render(<ImageViewer />);
    expect(container).toBeDefined();
  });
});
