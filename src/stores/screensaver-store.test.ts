import { describe, it, expect, beforeEach } from 'vitest';
import { useScreensaverStore } from './screensaver-store';

describe('Screensaver Store', () => {
  beforeEach(() => {
    useScreensaverStore.setState({
      enabled: true,
      type: 'stars',
      idleTimeoutSeconds: 120,
    });
  });

  it('has correct defaults', () => {
    const state = useScreensaverStore.getState();
    expect(state.enabled).toBe(true);
    expect(state.type).toBe('stars');
    expect(state.idleTimeoutSeconds).toBe(120);
  });

  it('can toggle enabled', () => {
    useScreensaverStore.getState().setEnabled(false);
    expect(useScreensaverStore.getState().enabled).toBe(false);
  });

  it('can set screensaver type', () => {
    useScreensaverStore.getState().setType('matrix');
    expect(useScreensaverStore.getState().type).toBe('matrix');
  });

  it('can set idle timeout', () => {
    useScreensaverStore.getState().setIdleTimeoutSeconds(300);
    expect(useScreensaverStore.getState().idleTimeoutSeconds).toBe(300);
  });

  it('clamps idle timeout to valid range', () => {
    useScreensaverStore.getState().setIdleTimeoutSeconds(10);
    expect(useScreensaverStore.getState().idleTimeoutSeconds).toBe(60);
    useScreensaverStore.getState().setIdleTimeoutSeconds(999);
    expect(useScreensaverStore.getState().idleTimeoutSeconds).toBe(300);
  });
});
