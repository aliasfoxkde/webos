import { describe, it, expect, beforeEach } from 'vitest';
import { useWindowStore } from '@/wm/window-store';
import { SnapPosition } from '@/wm/types';

describe('Window Store', () => {
  beforeEach(() => {
    useWindowStore.getState().clear();
  });

  describe('open', () => {
    it('should open a window with default size', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1',
        appId: 'test-app',
        title: 'Test Window',
      });

      expect(win.id).toBeDefined();
      expect(win.processId).toBe('proc-1');
      expect(win.appId).toBe('test-app');
      expect(win.title).toBe('Test Window');
      expect(win.isActive).toBe(true);
      expect(win.isMinimized).toBe(false);
      expect(win.isMaximized).toBe(false);
      expect(win.zIndex).toBeGreaterThan(0);
    });

    it('should set previous active window to inactive', () => {
      const win1 = useWindowStore.getState().open({
        processId: 'proc-1',
        appId: 'app1',
        title: 'Window 1',
      });
      const win2 = useWindowStore.getState().open({
        processId: 'proc-2',
        appId: 'app2',
        title: 'Window 2',
      });

      expect(useWindowStore.getState().get(win1.id)!.isActive).toBe(false);
      expect(useWindowStore.getState().get(win2.id)!.isActive).toBe(true);
    });

    it('should open with custom bounds', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1',
        appId: 'test-app',
        title: 'Test',
        bounds: { x: 100, y: 200, width: 600, height: 400 },
      });

      expect(win.bounds.x).toBe(100);
      expect(win.bounds.y).toBe(200);
      expect(win.bounds.width).toBe(600);
      expect(win.bounds.height).toBe(400);
    });

    it('should assign incrementing z-indices', () => {
      const win1 = useWindowStore.getState().open({
        processId: 'proc-1',
        appId: 'app1',
        title: 'W1',
      });
      const win2 = useWindowStore.getState().open({
        processId: 'proc-2',
        appId: 'app2',
        title: 'W2',
      });

      expect(win2.zIndex).toBeGreaterThan(win1.zIndex);
    });
  });

  describe('close', () => {
    it('should close a window', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1',
        appId: 'test-app',
        title: 'Test',
      });
      useWindowStore.getState().close(win.id);

      expect(useWindowStore.getState().get(win.id)).toBeUndefined();
    });

    it('should activate the top remaining window', () => {
      const w1 = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
      });
      const w2 = useWindowStore.getState().open({
        processId: 'proc-2', appId: 'app2', title: 'W2',
      });
      const w3 = useWindowStore.getState().open({
        processId: 'proc-3', appId: 'app3', title: 'W3',
      });

      useWindowStore.getState().close(w3.id);

      expect(useWindowStore.getState().get(w2.id)!.isActive).toBe(true);
      expect(useWindowStore.getState().get(w1.id)!.isActive).toBe(false);
    });

    it('should handle closing non-existent window', () => {
      expect(() => useWindowStore.getState().close('nonexistent')).not.toThrow();
    });
  });

  describe('focus', () => {
    it('should focus a window and unfocus others', () => {
      const w1 = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
      });
      const w2 = useWindowStore.getState().open({
        processId: 'proc-2', appId: 'app2', title: 'W2',
      });

      useWindowStore.getState().focus(w1.id);

      expect(useWindowStore.getState().get(w1.id)!.isActive).toBe(true);
      expect(useWindowStore.getState().get(w1.id)!.zIndex).toBeGreaterThan(
        useWindowStore.getState().get(w2.id)!.zIndex,
      );
    });

    it('should un-minimize when focusing', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
      });
      useWindowStore.getState().minimize(win.id);
      expect(useWindowStore.getState().get(win.id)!.isMinimized).toBe(true);

      useWindowStore.getState().focus(win.id);
      expect(useWindowStore.getState().get(win.id)!.isMinimized).toBe(false);
    });
  });

  describe('minimize', () => {
    it('should minimize a window', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
      });
      useWindowStore.getState().minimize(win.id);

      expect(useWindowStore.getState().get(win.id)!.isMinimized).toBe(true);
      expect(useWindowStore.getState().get(win.id)!.isActive).toBe(false);
    });

    it('should activate next top window', () => {
      const w1 = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
      });
      const w2 = useWindowStore.getState().open({
        processId: 'proc-2', appId: 'app2', title: 'W2',
      });

      useWindowStore.getState().minimize(w2.id);
      expect(useWindowStore.getState().get(w1.id)!.isActive).toBe(true);
    });
  });

  describe('restore', () => {
    it('should restore a minimized window', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
        bounds: { x: 100, y: 100, width: 500, height: 400 },
      });
      useWindowStore.getState().minimize(win.id);
      useWindowStore.getState().restore(win.id);

      const restored = useWindowStore.getState().get(win.id)!;
      expect(restored.isMinimized).toBe(false);
      expect(restored.isActive).toBe(true);
    });

    it('should restore from maximized', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
        bounds: { x: 100, y: 100, width: 500, height: 400 },
      });
      useWindowStore.getState().maximize(win.id);
      useWindowStore.getState().restore(win.id);

      const restored = useWindowStore.getState().get(win.id)!;
      expect(restored.isMaximized).toBe(false);
      expect(restored.bounds.x).toBe(100);
      expect(restored.bounds.y).toBe(100);
      expect(restored.bounds.width).toBe(500);
    });
  });

  describe('maximize', () => {
    it('should maximize a window', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
        bounds: { x: 100, y: 100, width: 500, height: 400 },
      });
      useWindowStore.getState().maximize(win.id);

      const maximized = useWindowStore.getState().get(win.id)!;
      expect(maximized.isMaximized).toBe(true);
      expect(maximized.prevBounds).toBeDefined();
      expect(maximized.prevBounds!.x).toBe(100);
      expect(maximized.prevBounds!.width).toBe(500);
    });
  });

  describe('snap', () => {
    const viewport = { width: 1920, height: 1080 };

    it('should snap to left half', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
      });
      useWindowStore.getState().snap(win.id, SnapPosition.Left, viewport);

      const snapped = useWindowStore.getState().get(win.id)!;
      expect(snapped.bounds.x).toBe(0);
      expect(snapped.bounds.y).toBe(0);
      expect(snapped.bounds.width).toBe(960);
      expect(snapped.bounds.height).toBe(1080);
      expect(snapped.snap).toBe(SnapPosition.Left);
    });

    it('should snap to right half', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
      });
      useWindowStore.getState().snap(win.id, SnapPosition.Right, viewport);

      const snapped = useWindowStore.getState().get(win.id)!;
      expect(snapped.bounds.x).toBe(960);
      expect(snapped.bounds.width).toBe(960);
    });

    it('should snap to maximize', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
      });
      useWindowStore.getState().snap(win.id, SnapPosition.Maximize, viewport);

      const snapped = useWindowStore.getState().get(win.id)!;
      expect(snapped.isMaximized).toBe(true);
      expect(snapped.bounds.width).toBe(1920);
    });
  });

  describe('move', () => {
    it('should move a window', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
        bounds: { x: 0, y: 0, width: 500, height: 400 },
      });
      useWindowStore.getState().move(win.id, { x: 50, y: 75 });

      const moved = useWindowStore.getState().get(win.id)!;
      expect(moved.bounds.x).toBe(50);
      expect(moved.bounds.y).toBe(75);
    });
  });

  describe('resize', () => {
    it('should resize a window', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
        bounds: { x: 0, y: 0, width: 500, height: 400 },
      });
      useWindowStore.getState().resize(win.id, { width: 700, height: 600 });

      const resized = useWindowStore.getState().get(win.id)!;
      expect(resized.bounds.width).toBe(700);
      expect(resized.bounds.height).toBe(600);
    });
  });

  describe('setTitle', () => {
    it('should update window title', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'Old Title',
      });
      useWindowStore.getState().setTitle(win.id, 'New Title');

      expect(useWindowStore.getState().get(win.id)!.title).toBe('New Title');
    });
  });

  describe('get', () => {
    it('should return window by id', () => {
      const win = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
      });
      expect(useWindowStore.getState().get(win.id)).toBeDefined();
      expect(useWindowStore.getState().get('nonexistent')).toBeUndefined();
    });

    it('should return window by process id', () => {
      const win = useWindowStore.getState().open({
        processId: 'my-proc', appId: 'app1', title: 'W1',
      });
      expect(useWindowStore.getState().getByProcessId('my-proc')!.id).toBe(win.id);
    });
  });

  describe('getActive', () => {
    it('should return the active window', () => {
      const w1 = useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
      });
      useWindowStore.getState().open({
        processId: 'proc-2', appId: 'app2', title: 'W2',
      });

      expect(useWindowStore.getState().getActive()!.id).not.toBe(w1.id);
    });
  });

  describe('clear', () => {
    it('should clear all windows', () => {
      useWindowStore.getState().open({
        processId: 'proc-1', appId: 'app1', title: 'W1',
      });
      useWindowStore.getState().open({
        processId: 'proc-2', appId: 'app2', title: 'W2',
      });
      useWindowStore.getState().clear();

      expect(useWindowStore.getState().windows).toHaveLength(0);
    });
  });
});
