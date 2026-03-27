import type { AppDefinition } from './types';

/**
 * Registry for all available applications.
 * Apps register themselves here; the shell uses this for the start menu,
 * file manager uses it for file associations, etc.
 */
export class AppRegistry {
  private apps = new Map<string, AppDefinition>();

  /**
   * Register an app definition.
   */
  register(app: AppDefinition): void {
    if (this.apps.has(app.id)) {
      throw new Error(`App already registered: ${app.id}`);
    }
    this.apps.set(app.id, app);
  }

  /**
   * Unregister an app.
   */
  unregister(appId: string): void {
    const app = this.apps.get(appId);
    if (app?.systemApp) {
      throw new Error(`Cannot unregister system app: ${appId}`);
    }
    this.apps.delete(appId);
  }

  /**
   * Get an app by ID.
   */
  get(appId: string): AppDefinition | undefined {
    return this.apps.get(appId);
  }

  /**
   * Get all registered apps.
   */
  getAll(): AppDefinition[] {
    return Array.from(this.apps.values());
  }

  /**
   * Find apps that can handle a given MIME type.
   */
  findByMimeType(mimeType: string): AppDefinition[] {
    const results: AppDefinition[] = [];
    for (const app of this.apps.values()) {
      if (app.fileAssociations?.includes(mimeType)) {
        results.push(app);
      }
    }
    return results;
  }

  /**
   * Find an app by file extension.
   */
  findByExtension(extension: string): AppDefinition[] {
    const mimeMap: Record<string, string> = {
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.ts': 'text/typescript',
      '.json': 'application/json',
      '.csv': 'text/csv',
      '.xml': 'application/xml',
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.draw': 'application/x-webos-draw',
      '.note': 'application/x-webos-note',
      '.log': 'text/plain',
    };
    const mime = mimeMap[extension.toLowerCase()];
    if (!mime) return [];
    return this.findByMimeType(mime);
  }

  /**
   * Check if an app is registered.
   */
  has(appId: string): boolean {
    return this.apps.has(appId);
  }

  /**
   * Get app count.
   */
  get count(): number {
    return this.apps.size;
  }

  /**
   * Clear all non-system apps (for testing).
   */
  clearNonSystem(): void {
    for (const [id, app] of this.apps) {
      if (!app.systemApp) {
        this.apps.delete(id);
      }
    }
  }

  /**
   * Clear all apps (for testing).
   */
  clear(): void {
    this.apps.clear();
  }
}

// Singleton instance
export const appRegistry = new AppRegistry();
