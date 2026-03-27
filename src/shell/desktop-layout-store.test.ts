import { describe, it, expect } from 'vitest';
import { useDesktopLayoutStore } from './desktop-layout-store';

describe('Desktop Layout Store', () => {
  it('can update a position', () => {
    const store = useDesktopLayoutStore.getState();
    store.setPosition('test-app', { x: 200, y: 300 });
    expect(useDesktopLayoutStore.getState().positions['test-app']).toEqual({ x: 200, y: 300 });
  });

  it('can reset positions', () => {
    const store = useDesktopLayoutStore.getState();
    store.setPosition('test-app', { x: 999, y: 999 });
    store.resetPositions();
    // After reset, test-app should no longer be at 999,999
    const pos = useDesktopLayoutStore.getState().positions['test-app'];
    expect(pos).not.toEqual({ x: 999, y: 999 });
  });

  it('persists positions across state reads', () => {
    useDesktopLayoutStore.getState().setPosition('app-a', { x: 50, y: 50 });
    const pos = useDesktopLayoutStore.getState().positions['app-a'];
    expect(pos).toEqual({ x: 50, y: 50 });
  });
});
