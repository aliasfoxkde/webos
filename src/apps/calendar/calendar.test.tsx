import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock localStorage
const store: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
});

// Mock prompt
vi.stubGlobal('prompt', (_msg: string) => 'Test Event');

import { Calendar } from './Calendar';

describe('Calendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage between tests
    Object.keys(store).forEach((k) => delete store[k]);
  });

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
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('28')).toBeDefined();
  });

  it('renders month navigation buttons', () => {
    render(<Calendar />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it('opens events sidebar when a day is clicked', () => {
    render(<Calendar />);
    // Click on day 15
    const day15 = screen.getByText('15');
    fireEvent.click(day15);
    // Should show the date in the sidebar
    expect(screen.getByText(/Add/)).toBeDefined();
  });

  it('shows no events message in sidebar', () => {
    render(<Calendar />);
    const day10 = screen.getByText('10');
    fireEvent.click(day10);
    expect(screen.getByText('No events')).toBeDefined();
  });

  it('shows event dots hint text', () => {
    render(<Calendar />);
    expect(screen.getByText(/Click a day to view events/)).toBeDefined();
  });
});
