import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Calendar } from './Calendar';

describe('Calendar', () => {
  it('renders weekday headers', () => {
    render(<Calendar />);
    expect(screen.getByText('Sun')).toBeDefined();
    expect(screen.getByText('Mon')).toBeDefined();
    expect(screen.getByText('Sat')).toBeDefined();
  });

  it('renders the Today button', () => {
    render(<Calendar />);
    expect(screen.getByText('Today')).toBeDefined();
  });

  it('renders day cells for current month', () => {
    render(<Calendar />);
    // Should have at least day 1 and day 28
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('28')).toBeDefined();
  });

  it('renders month navigation buttons', () => {
    render(<Calendar />);
    const buttons = screen.getAllByRole('button');
    // Should have prev (<), Today, and next (>) buttons
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});
