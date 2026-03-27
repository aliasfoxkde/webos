import { describe, it, expect, beforeEach } from 'vitest';
import { AppRegistry } from '@/kernel/app-registry';
import type { AppDefinition } from '@/kernel/types';

const makeApp = (id: string, opts: Partial<AppDefinition> = {}): AppDefinition => ({
  id,
  title: `App ${id}`,
  description: 'Test app',
  icon: `${id}.png`,
  component: async () => () => null,
  defaultWindow: { width: 800, height: 600 },
  permissions: [],
  ...opts,
});

describe('AppRegistry', () => {
  let registry: AppRegistry;

  beforeEach(() => {
    registry = new AppRegistry();
  });

  describe('register/get', () => {
    it('should register and retrieve an app', () => {
      const app = makeApp('writer');
      registry.register(app);
      expect(registry.get('writer')).toEqual(app);
    });

    it('should throw on duplicate registration', () => {
      registry.register(makeApp('writer'));
      expect(() => registry.register(makeApp('writer'))).toThrow('already registered');
    });
  });

  describe('unregister', () => {
    it('should unregister a non-system app', () => {
      registry.register(makeApp('writer'));
      registry.unregister('writer');
      expect(registry.get('writer')).toBeUndefined();
    });

    it('should throw when unregistering a system app', () => {
      registry.register(makeApp('settings', { systemApp: true }));
      expect(() => registry.unregister('settings')).toThrow('system app');
    });
  });

  describe('getAll', () => {
    it('should return all registered apps', () => {
      registry.register(makeApp('writer'));
      registry.register(makeApp('calc'));
      expect(registry.getAll()).toHaveLength(2);
    });
  });

  describe('findByMimeType', () => {
    it('should find apps by MIME type', () => {
      registry.register(makeApp('writer', { fileAssociations: ['text/plain', 'text/html'] }));
      registry.register(makeApp('calc', { fileAssociations: ['text/csv'] }));
      expect(registry.findByMimeType('text/plain')).toHaveLength(1);
      expect(registry.findByMimeType('text/csv')).toHaveLength(1);
      expect(registry.findByMimeType('application/pdf')).toHaveLength(0);
    });
  });

  describe('findByExtension', () => {
    it('should find apps by file extension', () => {
      registry.register(makeApp('writer', { fileAssociations: ['text/plain'] }));
      expect(registry.findByExtension('.txt')).toHaveLength(1);
      expect(registry.findByExtension('.unknown')).toHaveLength(0);
    });
  });

  describe('has', () => {
    it('should check if app is registered', () => {
      registry.register(makeApp('writer'));
      expect(registry.has('writer')).toBe(true);
      expect(registry.has('unknown')).toBe(false);
    });
  });

  describe('count', () => {
    it('should return correct count', () => {
      registry.register(makeApp('a'));
      registry.register(makeApp('b'));
      expect(registry.count).toBe(2);
    });
  });
});
