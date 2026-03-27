import type { PermissionType } from './types';

/**
 * Manages app permissions. Apps request permissions; the permission system
 * checks grants and can prompt the user (future enhancement).
 */
export class PermissionManager {
  // Granted permissions per app
  private grants = new Map<string, Set<PermissionType>>();

  // Default allowed permissions (don't need to be explicitly granted)
  private defaults: PermissionType[] = [
    'clipboard:read',
    'clipboard:write',
    'filesystem:read',
    'notifications',
  ];

  /**
   * Check if an app has a specific permission.
   */
  has(appId: string, permission: PermissionType): boolean {
    return (
      this.defaults.includes(permission) ||
      this.grants.get(appId)?.has(permission) === true
    );
  }

  /**
   * Grant a permission to an app.
   */
  grant(appId: string, permission: PermissionType): void {
    let perms = this.grants.get(appId);
    if (!perms) {
      perms = new Set();
      this.grants.set(appId, perms);
    }
    perms.add(permission);
  }

  /**
   * Revoke a permission from an app.
   */
  revoke(appId: string, permission: PermissionType): void {
    this.grants.get(appId)?.delete(permission);
  }

  /**
   * Get all granted permissions for an app.
   */
  getPermissions(appId: string): PermissionType[] {
    const granted = this.grants.get(appId);
    if (!granted) return [...this.defaults];
    return [...new Set([...this.defaults, ...granted])];
  }

  /**
   * Check if an app has ALL specified permissions.
   */
  hasAll(appId: string, permissions: PermissionType[]): boolean {
    return permissions.every((p) => this.has(appId, p));
  }

  /**
   * Revoke all permissions for an app.
   */
  revokeAll(appId: string): void {
    this.grants.delete(appId);
  }

  /**
   * Reset all permissions (for testing).
   */
  reset(): void {
    this.grants.clear();
  }
}

// Singleton instance
export const permissionManager = new PermissionManager();
