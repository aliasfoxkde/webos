import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Camera } from './Camera';

// Mock getUserMedia
const mockGetUserMedia = vi.fn();
Object.defineProperty(globalThis.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
});

beforeEach(() => {
  mockGetUserMedia.mockReset();
  mockGetUserMedia.mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }],
  });
});

describe('Camera', () => {
  it('renders video element', () => {
    const { container } = render(<Camera />);
    expect(container.querySelector('video')).toBeDefined();
  });

  it('renders take photo button', () => {
    render(<Camera />);
    expect(screen.getByLabelText('Take Photo')).toBeDefined();
  });

  it('renders mirror toggle button', () => {
    render(<Camera />);
    expect(screen.getByTitle('Toggle mirror')).toBeDefined();
  });

  it('shows error state when camera access denied', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('denied'));
    render(<Camera />);
    const error = await screen.findByText('Camera access denied');
    expect(error).toBeDefined();
  });

  it('shows retry button on error', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('denied'));
    render(<Camera />);
    const retry = await screen.findByText('Retry');
    expect(retry).toBeDefined();
  });
});
