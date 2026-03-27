import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders desktop icons after boot', () => {
    render(<App />);
    expect(screen.getByText('File Manager')).toBeDefined();
    expect(screen.getByText('Terminal')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
  });

  it('renders the start button in taskbar', () => {
    render(<App />);
    expect(screen.getByText('Start')).toBeDefined();
  });
});
