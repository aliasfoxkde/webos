import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveWindowStates,
  loadWindowStates,
  getWindowState,
  clearWindowStates,
} from '@/wm/window-state-persist';

describe('Window State Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load window states', async () => {
    const states = [
      {
        id: 'win-1',
        appId: 'test-app',
        bounds: { x: 100, y: 200, width: 800, height: 600 },
        isMaximized: false,
      },
    ];

    await saveWindowStates(states);
    const loaded = await loadWindowStates();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('win-1');
    expect(loaded[0].bounds.x).toBe(100);
  });

  it('should return empty array when no states saved', async () => {
    const loaded = await loadWindowStates();
    expect(loaded).toHaveLength(0);
  });

  it('should get state by appId', async () => {
    const states = [
      { id: 'win-1', appId: 'writer', bounds: { x: 0, y: 0, width: 800, height: 600 }, isMaximized: false },
      { id: 'win-2', appId: 'calc', bounds: { x: 50, y: 50, width: 600, height: 400 }, isMaximized: true },
    ];

    await saveWindowStates(states);
    const writerState = await getWindowState('writer');

    expect(writerState).toBeDefined();
    expect(writerState!.id).toBe('win-1');
  });

  it('should return undefined for unknown appId', async () => {
    const state = await getWindowState('nonexistent');
    expect(state).toBeUndefined();
  });

  it('should clear all states', async () => {
    const states = [
      { id: 'win-1', appId: 'app1', bounds: { x: 0, y: 0, width: 800, height: 600 }, isMaximized: false },
    ];

    await saveWindowStates(states);
    await clearWindowStates();
    const loaded = await loadWindowStates();

    expect(loaded).toHaveLength(0);
  });
});
