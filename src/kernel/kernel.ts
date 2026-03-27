import { eventBus, EventBus } from './event-bus';
import { processManager, ProcessManager } from './process-manager';
import { appRegistry, AppRegistry } from './app-registry';
import { permissionManager, PermissionManager } from './permissions';
import { registerBuiltinApps } from './builtin-apps';
import { createLogger } from '@/lib/logger';
import type { AppDefinition, PermissionType } from './types';

const log = createLogger('kernel');

/**
 * Kernel facade - the central entry point for the OS.
 * Wires together event bus, process manager, app registry, and permissions.
 */
export class Kernel {
  readonly events: EventBus;
  readonly processes: ProcessManager;
  readonly apps: AppRegistry;
  readonly permissions: PermissionManager;

  private _booted = false;

  constructor(
    deps?: {
      eventBus?: EventBus;
      processManager?: ProcessManager;
      appRegistry?: AppRegistry;
      permissionManager?: PermissionManager;
    },
  ) {
    this.events = deps?.eventBus ?? eventBus;
    this.processes = deps?.processManager ?? processManager;
    this.apps = deps?.appRegistry ?? appRegistry;
    this.permissions = deps?.permissionManager ?? permissionManager;
  }

  /**
   * Boot the kernel. Initializes default state.
   */
  boot(): void {
    if (this._booted) {
      log.warn('boot() called but kernel already booted');
      return;
    }
    log.info('Booting kernel...');
    registerBuiltinApps();
    this._booted = true;
    this.events.emit('kernel:boot', {});
    log.info(`Kernel booted. ${this.apps.getAll().length} apps registered.`);
  }

  /**
   * Check if the kernel has been booted.
   */
  get booted(): boolean {
    return this._booted;
  }

  /**
   * Launch an app by ID.
   * Returns the process ID, or the existing process ID if singleton.
   */
  launchApp(appId: string, windowId: string): string | null {
    const app = this.apps.get(appId);
    if (!app) {
      log.error(`launchApp: app "${appId}" not found in registry`);
      return null;
    }

    log.info(`Launching app "${appId}" (window: ${windowId})`);
    const process = this.processes.launch(app, windowId);
    log.debug(`Process ${process.id} created for "${appId}"`);
    return process.id;
  }

  /**
   * Close an app by process ID.
   */
  closeApp(processId: string): void {
    log.info(`Closing process ${processId}`);
    this.processes.close(processId);
  }

  /**
   * Focus an app by process ID.
   */
  focusApp(processId: string): void {
    log.debug(`Focusing process ${processId}`);
    this.processes.focus(processId);
  }

  /**
   * Register an app definition.
   */
  registerApp(app: AppDefinition): void {
    this.apps.register(app);
  }

  /**
   * Check if an app has a permission.
   */
  checkPermission(appId: string, permission: PermissionType): boolean {
    return this.permissions.has(appId, permission);
  }

  /**
   * Grant a permission to an app.
   */
  grantPermission(appId: string, permission: PermissionType): void {
    this.permissions.grant(appId, permission);
  }

  /**
   * Shutdown the kernel.
   */
  shutdown(): void {
    log.info('Shutting down kernel...');
    this.events.emit('kernel:shutdown', {});
    this.processes.reset();
    this._booted = false;
    log.info('Kernel shut down.');
  }
}

// Singleton instance
export const kernel = new Kernel();
