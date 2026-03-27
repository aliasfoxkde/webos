import { eventBus, EventBus } from './event-bus';
import { processManager, ProcessManager } from './process-manager';
import { appRegistry, AppRegistry } from './app-registry';
import { permissionManager, PermissionManager } from './permissions';
import { registerBuiltinApps } from './builtin-apps';
import type { AppDefinition, PermissionType } from './types';

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
    if (this._booted) return;
    registerBuiltinApps();
    this._booted = true;
    this.events.emit('kernel:boot', {});
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
    if (!app) return null;

    const process = this.processes.launch(app, windowId);
    return process.id;
  }

  /**
   * Close an app by process ID.
   */
  closeApp(processId: string): void {
    this.processes.close(processId);
  }

  /**
   * Focus an app by process ID.
   */
  focusApp(processId: string): void {
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
    this.events.emit('kernel:shutdown', {});
    this.processes.reset();
    this._booted = false;
  }
}

// Singleton instance
export const kernel = new Kernel();
