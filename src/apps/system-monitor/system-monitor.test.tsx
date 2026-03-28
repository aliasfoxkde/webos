import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock useWindowStore
vi.mock('@/wm/window-store', () => ({
  useWindowStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      windows: [
        {
          id: 'win-1',
          appId: 'terminal',
          title: 'Terminal',
          isMinimized: false,
          bounds: { width: 650, height: 420 },
        },
      ],
      getActive: () => ({
        id: 'win-1',
        appId: 'terminal',
        title: 'Terminal',
        isMinimized: false,
        bounds: { width: 650, height: 420 },
      }),
    };
    return selector(state);
  },
}));

import { SystemMonitor } from './SystemMonitor';

describe('SystemMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders all three tab buttons', () => {
    render(<SystemMonitor />);
    expect(screen.getByText('Processes')).toBeDefined();
    expect(screen.getByText('Performance')).toBeDefined();
    expect(screen.getByText('Storage')).toBeDefined();
  });

  it('renders process table headers', () => {
    render(<SystemMonitor />);
    expect(screen.getByText('Title')).toBeDefined();
    expect(screen.getByText('App')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('Size')).toBeDefined();
  });

  it('renders process list on processes tab', () => {
    render(<SystemMonitor />);
    expect(screen.getByText('Terminal')).toBeDefined();
  });

  it('switches to storage tab', () => {
    render(<SystemMonitor />);
    fireEvent.click(screen.getByText('Storage'));
    expect(screen.getByText('Virtual File System')).toBeDefined();
  });
});
