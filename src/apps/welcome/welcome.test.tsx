import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Welcome } from './Welcome';

describe('Welcome', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the welcome heading', () => {
    render(<Welcome />);
    expect(screen.getByText('Welcome to WebOS')).toBeDefined();
  });

  it('renders the subtitle', () => {
    render(<Welcome />);
    expect(screen.getByText('Your browser-based operating system')).toBeDefined();
  });

  it('renders the Get Started button', () => {
    render(<Welcome />);
    expect(screen.getByText('Get Started')).toBeDefined();
  });

  it('renders feature grid items', () => {
    render(<Welcome />);
    expect(screen.getByText('Files')).toBeDefined();
    expect(screen.getByText('Writer')).toBeDefined();
    expect(screen.getByText('Draw')).toBeDefined();
    expect(screen.getByText('Terminal')).toBeDefined();
    expect(screen.getByText('Browser')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
    expect(screen.getByText('Calendar')).toBeDefined();
    expect(screen.getByText('Calculator')).toBeDefined();
  });

  it('renders Quick Tips section', () => {
    render(<Welcome />);
    expect(screen.getByText('Quick Tips')).toBeDefined();
    expect(screen.getByText('Double-click the desktop to create shortcuts')).toBeDefined();
    expect(screen.getByText('Right-click for context menus')).toBeDefined();
    expect(screen.getByText('Drag windows to screen edges to snap them')).toBeDefined();
  });
});
