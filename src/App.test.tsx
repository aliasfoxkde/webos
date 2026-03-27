import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders WebOS title', () => {
    render(<App />);
    expect(screen.getByText('WebOS')).toBeDefined();
  });

  it('renders subtitle', () => {
    render(<App />);
    expect(screen.getByText('Open Source Web Operating System')).toBeDefined();
  });
});
