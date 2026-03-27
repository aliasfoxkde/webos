import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Browser } from './Browser';

vi.mock('./use-browser-history', () => ({
  useBrowserHistory: () => ({
    current: { url: 'about:blank', title: 'New Tab' },
    navigate: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    canGoBack: false,
    canGoForward: false,
  }),
}));

describe('Browser', () => {
  it('renders the URL input', () => {
    render(<Browser />);
    expect(screen.getByPlaceholderText('Search or enter URL...')).toBeDefined();
  });

  it('renders the homepage with title', () => {
    render(<Browser />);
    expect(screen.getByText('WebOS Browser')).toBeDefined();
  });

  it('renders navigation buttons', () => {
    render(<Browser />);
    expect(screen.getByTitle('Back')).toBeDefined();
    expect(screen.getByTitle('Forward')).toBeDefined();
    expect(screen.getByTitle('Refresh')).toBeDefined();
    expect(screen.getByTitle('Home')).toBeDefined();
  });

  it('renders a second URL input on homepage', () => {
    render(<Browser />);
    expect(screen.getByPlaceholderText('Search the web...')).toBeDefined();
  });
});
