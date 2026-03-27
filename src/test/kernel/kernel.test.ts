import { describe, it, expect, beforeEach } from 'vitest';
import { Kernel } from '@/kernel/kernel';
import { EventBus } from '@/kernel/event-bus';
import { ProcessManager } from '@/kernel/process-manager';
import { AppRegistry } from '@/kernel/app-registry';
import { PermissionManager } from '@/kernel/permissions';
import type { AppDefinition } from '@/kernel/types';

const mockApp: AppDefinition = {
  id: 'test-app',
  title: 'Test',
  description: 'Test',
  icon: 'test',
  component: async () => () => null,
  defaultWindow: { width: 800, height: 600 },
  permissions: [],
};

describe('Kernel', () => {
  let kernel: Kernel;

  beforeEach(() => {
    kernel = new Kernel({
      eventBus: new EventBus(),
      processManager: new ProcessManager(),
      appRegistry: new AppRegistry(),
      permissionManager: new PermissionManager(),
    });
  });

  it('should boot and set booted flag', () => {
    expect(kernel.booted).toBe(false);
    kernel.boot();
    expect(kernel.booted).toBe(true);
  });

  it('should not boot twice', () => {
    kernel.boot();
    kernel.boot();
    // No error, still booted
    expect(kernel.booted).toBe(true);
  });

  it('should register and launch an app', () => {
    kernel.registerApp(mockApp);
    kernel.boot();
    const pid = kernel.launchApp('test-app', 'win-1');
    expect(pid).toBeTruthy();
    expect(kernel.processes.get(pid!)).toBeDefined();
  });

  it('should return null for unknown app', () => {
    kernel.boot();
    const pid = kernel.launchApp('unknown', 'win-1');
    expect(pid).toBeNull();
  });

  it('should close an app', () => {
    kernel.registerApp(mockApp);
    kernel.boot();
    const pid = kernel.launchApp('test-app', 'win-1');
    kernel.closeApp(pid!);
    expect(kernel.processes.get(pid!)).toBeUndefined();
  });

  it('should focus an app', () => {
    kernel.registerApp(mockApp);
    kernel.boot();
    const pid = kernel.launchApp('test-app', 'win-1');
    kernel.focusApp(pid!);
    expect(kernel.processes.getFocused()?.id).toBe(pid);
  });

  it('should check permissions', () => {
    expect(kernel.checkPermission('test', 'clipboard:read')).toBe(true); // default
    expect(kernel.checkPermission('test', 'network')).toBe(false);
  });

  it('should grant permissions', () => {
    kernel.grantPermission('test', 'network');
    expect(kernel.checkPermission('test', 'network')).toBe(true);
  });

  it('should shutdown', () => {
    kernel.registerApp(mockApp);
    kernel.boot();
    kernel.launchApp('test-app', 'win-1');
    kernel.shutdown();
    expect(kernel.booted).toBe(false);
    expect(kernel.processes.getAll()).toHaveLength(0);
  });
});
