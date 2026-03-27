import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LockScreen } from './LockScreen';

describe('LockScreen', () => {
  it('renders the time display', () => {
    render(<LockScreen onUnlock={vi.fn()} />);
    // Time is shown as HH:MM (24h format)
    const timeEl = screen.getByText(/\d{2}:\d{2}/);
    expect(timeEl).toBeDefined();
  });

  it('renders the avatar', () => {
    render(<LockScreen onUnlock={vi.fn()} />);
    // Avatar shows initial "U"
    expect(screen.getByText('U')).toBeDefined();
  });

  it('shows click-to-unlock prompt', () => {
    render(<LockScreen onUnlock={vi.fn()} />);
    expect(screen.getByText('Click anywhere to unlock')).toBeDefined();
  });

  it('shows sign in button after click', () => {
    const { container } = render(<LockScreen onUnlock={vi.fn()} />);
    // Click on the overlay
    fireEvent.click(container.firstElementChild!);
    // Should reveal the Sign In button
    expect(screen.getByText('Sign In')).toBeDefined();
  });

  it('calls onUnlock when sign in is clicked', () => {
    const onUnlock = vi.fn();
    const { container } = render(<LockScreen onUnlock={onUnlock} />);
    // Click overlay to reveal sign in
    fireEvent.click(container.firstElementChild!);
    // Click Sign In
    fireEvent.click(screen.getByText('Sign In'));
    expect(onUnlock).toHaveBeenCalledOnce();
  });
});
