import { describe, it, expect, beforeEach } from 'vitest';
import { useQuickSettingsStore } from './quick-settings-store';

describe('Quick Settings Store', () => {
  beforeEach(() => {
    useQuickSettingsStore.setState({
      wifiEnabled: true,
      bluetoothEnabled: false,
      dndEnabled: false,
      nightModeEnabled: false,
      volume: 75,
      brightness: 100,
    });
  });

  it('has correct defaults', () => {
    const state = useQuickSettingsStore.getState();
    expect(state.wifiEnabled).toBe(true);
    expect(state.bluetoothEnabled).toBe(false);
    expect(state.dndEnabled).toBe(false);
    expect(state.nightModeEnabled).toBe(false);
    expect(state.volume).toBe(75);
    expect(state.brightness).toBe(100);
  });

  it('can toggle DND', () => {
    useQuickSettingsStore.getState().toggleDnd();
    expect(useQuickSettingsStore.getState().dndEnabled).toBe(true);
  });

  it('can toggle night mode', () => {
    useQuickSettingsStore.getState().toggleNightMode();
    expect(useQuickSettingsStore.getState().nightModeEnabled).toBe(true);
  });

  it('can set volume', () => {
    useQuickSettingsStore.getState().setVolume(50);
    expect(useQuickSettingsStore.getState().volume).toBe(50);
  });

  it('can set brightness', () => {
    useQuickSettingsStore.getState().setBrightness(80);
    expect(useQuickSettingsStore.getState().brightness).toBe(80);
  });
});
