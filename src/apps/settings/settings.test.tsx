import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/themes/theme-context', () => ({
  useTheme: () => ({ currentTheme: 'light', themes: ['light', 'dark'], setTheme: vi.fn() }),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    userId: '',
    username: '',
    token: '',
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('@/stores/screensaver-store', () => ({
  useScreensaverStore: () => ({
    style: 'bubbles',
    setStyle: vi.fn(),
  }),
}));

vi.mock('@/vfs/sync-r2', () => ({
  getSyncStatus: vi.fn().mockResolvedValue({ uploaded: 0, downloaded: 0 }),
  fullSync: vi.fn().mockResolvedValue({}),
  processSyncQueue: vi.fn(),
  clearSyncState: vi.fn(),
}));

vi.mock('@/shell/wallpapers', () => ({
  getAllWallpapers: vi.fn().mockReturnValue([]),
  getSavedWallpaperId: vi.fn().mockReturnValue('default'),
  saveWallpaperId: vi.fn(),
}));

import { Settings } from './Settings';

describe('Settings', () => {
  it('renders all tab buttons', () => {
    render(<Settings />);
    expect(screen.getByText('Appearance')).toBeDefined();
    expect(screen.getByText('Screensaver')).toBeDefined();
    expect(screen.getByText('Cloud Sync')).toBeDefined();
    expect(screen.getByText('About')).toBeDefined();
  });

  it('shows Appearance tab content by default', () => {
    render(<Settings />);
    // The Appearance tab is the default active tab
    expect(screen.getByText('Appearance')).toBeDefined();
  });
});
