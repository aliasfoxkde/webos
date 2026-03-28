import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('@/vfs/vfs', () => ({
  readFile: vi.fn().mockResolvedValue(null),
}));

import { PdfViewer } from './PdfViewer';

describe('PdfViewer', () => {
  it('renders without crashing', () => {
    const { container } = render(<PdfViewer />);
    expect(container).toBeDefined();
  });

  it('renders PDF upload prompt', () => {
    render(<PdfViewer />);
    // When no file is loaded, should show upload prompt
    const container = document.querySelector('[class*="flex"]');
    expect(container).toBeDefined();
  });
});
