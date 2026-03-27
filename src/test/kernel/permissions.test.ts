import { describe, it, expect, beforeEach } from 'vitest';
import { PermissionManager } from '@/kernel/permissions';

describe('PermissionManager', () => {
  let pm: PermissionManager;

  beforeEach(() => {
    pm = new PermissionManager();
  });

  describe('defaults', () => {
    it('should grant default permissions without explicit grant', () => {
      expect(pm.has('test-app', 'clipboard:read')).toBe(true);
      expect(pm.has('test-app', 'filesystem:read')).toBe(true);
      expect(pm.has('test-app', 'notifications')).toBe(true);
    });

    it('should NOT grant non-default permissions by default', () => {
      expect(pm.has('test-app', 'filesystem:write')).toBe(false);
      expect(pm.has('test-app', 'network')).toBe(false);
      expect(pm.has('test-app', 'camera')).toBe(false);
    });
  });

  describe('grant/revoke', () => {
    it('should grant a permission', () => {
      pm.grant('test-app', 'filesystem:write');
      expect(pm.has('test-app', 'filesystem:write')).toBe(true);
    });

    it('should revoke a permission', () => {
      pm.grant('test-app', 'filesystem:write');
      pm.revoke('test-app', 'filesystem:write');
      expect(pm.has('test-app', 'filesystem:write')).toBe(false);
    });

    it('should not affect other apps when revoking', () => {
      pm.grant('app-a', 'network');
      pm.grant('app-b', 'network');
      pm.revoke('app-a', 'network');
      expect(pm.has('app-a', 'network')).toBe(false);
      expect(pm.has('app-b', 'network')).toBe(true);
    });
  });

  describe('hasAll', () => {
    it('should return true when all permissions are granted', () => {
      pm.grant('test-app', 'filesystem:write');
      pm.grant('test-app', 'network');
      expect(pm.hasAll('test-app', ['filesystem:write', 'network'])).toBe(true);
    });

    it('should return false when some permissions are missing', () => {
      pm.grant('test-app', 'filesystem:write');
      expect(pm.hasAll('test-app', ['filesystem:write', 'network'])).toBe(false);
    });
  });

  describe('getPermissions', () => {
    it('should return defaults + granted permissions', () => {
      pm.grant('test-app', 'filesystem:write');
      const perms = pm.getPermissions('test-app');
      expect(perms).toContain('filesystem:write');
      expect(perms).toContain('clipboard:read'); // default
    });
  });

  describe('revokeAll', () => {
    it('should revoke all permissions for an app', () => {
      pm.grant('test-app', 'filesystem:write');
      pm.grant('test-app', 'network');
      pm.revokeAll('test-app');
      expect(pm.has('test-app', 'filesystem:write')).toBe(false);
      expect(pm.has('test-app', 'network')).toBe(false);
    });
  });
});
