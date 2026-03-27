import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Clock } from './Clock';

describe('Clock', () => {
  it('renders tab buttons', () => {
    render(<Clock />);
    const buttons = screen.getAllByRole('button');
    const tabLabels = buttons.map((b) => b.textContent);
    expect(tabLabels).toContain('Clock');
    expect(tabLabels).toContain('Stopwatch');
    expect(tabLabels).toContain('Timer');
  });

  it('renders the clock view by default', () => {
    render(<Clock />);
    // Clock view shows time with AM/PM
    const timeEl = screen.getByText(/(AM|PM)/);
    expect(timeEl).toBeDefined();
  });

  it('switches to stopwatch tab', async () => {
    render(<Clock />);
    const stopwatchBtn = screen.getByRole('button', { name: 'Stopwatch' });
    fireEvent.click(stopwatchBtn);
    // Should show initial time display in stopwatch
    expect(screen.getByText('00:00.00')).toBeDefined();
  });

  it('switches to timer tab', async () => {
    render(<Clock />);
    const timerBtn = screen.getByRole('button', { name: 'Timer' });
    fireEvent.click(timerBtn);
    // Timer view should show minute/second labels
    expect(screen.getByText('min')).toBeDefined();
    expect(screen.getByText('sec')).toBeDefined();
  });
});
