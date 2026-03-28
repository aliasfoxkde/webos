import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';

// Mock canvas context for jsdom
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
    putImageData: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
    setTransform: vi.fn(),
    getTransform: vi.fn().mockReturnValue({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    resetTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 100 }),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

vi.mock('@/vfs/vfs', () => ({
  readFile: vi.fn().mockResolvedValue({ content: '{"elements":[]}' }),
  writeFile: vi.fn().mockResolvedValue({}),
}));

import { Draw } from './Draw';

describe('Draw', () => {
  it('renders without crashing', () => {
    const { container } = render(<Draw />);
    expect(container).toBeDefined();
  });
});
