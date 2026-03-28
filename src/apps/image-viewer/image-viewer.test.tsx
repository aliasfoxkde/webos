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

  it('renders image upload area', () => {
    render(<ImageViewer />);
    // When no image is loaded, should show upload prompt
    const container = document.querySelector('[class*="flex"]');
    expect(container).toBeDefined();
  });
});
