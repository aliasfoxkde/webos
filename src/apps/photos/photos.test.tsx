import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Photos } from './Photos';

describe('Photos', () => {
  it('renders the photos header with count', () => {
    render(<Photos />);
    expect(screen.getByText(/Photos \(\d+\)/)).toBeDefined();
  });

  it('renders the Upload button', () => {
    render(<Photos />);
    const buttons = screen.getAllByText('Upload');
    // One in toolbar, one possibly in empty state (but we have placeholder photos)
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders placeholder photo names', () => {
    render(<Photos />);
    // PLACEHOLDER_PHOTOS includes "Sunset Beach"
    expect(screen.getByText('Sunset Beach')).toBeDefined();
  });

  it('renders the file input for uploads', () => {
    render(<Photos />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDefined();
    expect(fileInput.accept).toBe('image/*');
    expect(fileInput.multiple).toBe(true);
  });
});
