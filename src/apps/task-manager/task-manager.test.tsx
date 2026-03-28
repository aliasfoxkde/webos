import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockRefreshProcesses = vi.fn();

vi.mock('@/stores/kernel-store', () => ({
  useKernelStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        processes: [],
        refreshProcesses: mockRefreshProcesses,
        closeApp: vi.fn(),
      }),
    {
      getState: () => ({
        refreshProcesses: mockRefreshProcesses,
      }),
    },
  ),
}));

vi.mock('@/wm/window-store', () => ({
  useWindowStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      windows: [],
      close: vi.fn(),
    }),
}));

import { TaskManager } from './TaskManager';

describe('TaskManager', () => {
  it('renders Task Manager heading', () => {
    render(<TaskManager />);
    expect(screen.getByText('Task Manager')).toBeDefined();
  });

  it('shows empty state', () => {
    render(<TaskManager />);
    expect(screen.getByText('No running processes')).toBeDefined();
  });

  it('renders Refresh button', () => {
    render(<TaskManager />);
    expect(screen.getByText('Refresh')).toBeDefined();
  });
});
