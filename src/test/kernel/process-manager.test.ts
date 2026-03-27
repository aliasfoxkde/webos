import { describe, it, expect, beforeEach } from 'vitest';
import { ProcessManager } from '@/kernel/process-manager';
import type { AppDefinition } from '@/kernel/types';

const mockApp: AppDefinition = {
  id: 'test-app',
  title: 'Test App',
  description: 'Test',
  icon: 'test',
  component: async () => () => null,
  defaultWindow: { width: 800, height: 600 },
  permissions: [],
};

const singletonApp: AppDefinition = {
  id: 'singleton-app',
  title: 'Singleton',
  description: 'Test',
  icon: 'test',
  component: async () => () => null,
  defaultWindow: { width: 800, height: 600 },
  permissions: [],
  singleton: true,
};

describe('ProcessManager', () => {
  let pm: ProcessManager;

  beforeEach(() => {
    pm = new ProcessManager();
  });

  describe('launch', () => {
    it('should create a process with correct app ID', () => {
      const proc = pm.launch(mockApp, 'win-1');
      expect(proc.appId).toBe('test-app');
      expect(proc.windowId).toBe('win-1');
      expect(proc.state).toBe('running');
    });

    it('should assign unique IDs', () => {
      const p1 = pm.launch(mockApp, 'win-1');
      const p2 = pm.launch(mockApp, 'win-2');
      expect(p1.id).not.toBe(p2.id);
    });

    it('should return existing process for singleton apps', () => {
      const p1 = pm.launch(singletonApp, 'win-1');
      const p2 = pm.launch(singletonApp, 'win-2');
      expect(p1.id).toBe(p2.id);
    });
  });

  describe('focus/minimize/restore', () => {
    it('should focus a process', () => {
      const proc = pm.launch(mockApp, 'win-1');
      pm.minimize(proc.id);
      expect(pm.get(proc.id)?.state).toBe('minimized');
      pm.focus(proc.id);
      expect(pm.get(proc.id)?.state).toBe('running');
    });

    it('should minimize a process', () => {
      const proc = pm.launch(mockApp, 'win-1');
      pm.minimize(proc.id);
      expect(pm.get(proc.id)?.state).toBe('minimized');
    });

    it('should restore a minimized process', () => {
      const proc = pm.launch(mockApp, 'win-1');
      pm.minimize(proc.id);
      pm.restore(proc.id);
      expect(pm.get(proc.id)?.state).toBe('running');
    });
  });

  describe('close', () => {
    it('should remove a process', () => {
      const proc = pm.launch(mockApp, 'win-1');
      pm.close(proc.id);
      expect(pm.get(proc.id)).toBeUndefined();
    });

    it('should handle closing non-existent process', () => {
      expect(() => pm.close('nonexistent')).not.toThrow();
    });
  });

  describe('crash', () => {
    it('should mark process as crashed', () => {
      const proc = pm.launch(mockApp, 'win-1');
      const error = new Error('test crash');
      pm.crash(proc.id, error);
      expect(pm.get(proc.id)?.state).toBe('crashed');
    });
  });

  describe('getFocused', () => {
    it('should return the most recently focused process', () => {
      const p1 = pm.launch(mockApp, 'win-1');
      const p2 = pm.launch(mockApp, 'win-2');
      // Both are focused on launch; p2 was focused later
      expect(pm.getFocused()?.id).toBe(p2.id);
      // Explicitly focus p1
      pm.focus(p1.id);
      expect(pm.getFocused()?.id).toBe(p1.id);
    });

    it('should return undefined when no running processes', () => {
      expect(pm.getFocused()).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all processes', () => {
      pm.launch(mockApp, 'win-1');
      pm.launch(mockApp, 'win-2');
      expect(pm.getAll()).toHaveLength(2);
    });
  });

  describe('countByState', () => {
    it('should count processes by state', () => {
      const p1 = pm.launch(mockApp, 'win-1');
      pm.launch(mockApp, 'win-2');
      pm.minimize(p1.id);
      expect(pm.countByState('minimized')).toBe(1);
      expect(pm.countByState('running')).toBe(1);
      expect(pm.countByState()).toBe(2);
    });
  });

  describe('findByAppId', () => {
    it('should find process by app ID', () => {
      const proc = pm.launch(mockApp, 'win-1');
      expect(pm.findByAppId('test-app')?.id).toBe(proc.id);
    });

    it('should return undefined for unknown app', () => {
      expect(pm.findByAppId('unknown')).toBeUndefined();
    });
  });
});
