import { useCallback } from 'react';
import { useKernelStore } from '@/stores/kernel-store';
import { useWindowStore } from '@/wm/window-store';
import { kernel } from '@/kernel/kernel';
import { createLogger } from '@/lib/logger';
import type { PermissionType } from '@/kernel/types';

const log = createLogger('hook:kernel');

/**
 * Hook to access kernel from components.
 * Bridges kernel process management with window manager.
 */
export function useKernel() {
  const { booted, processes, focusedProcessId, apps } = useKernelStore();
  const launchProcess = useKernelStore((s) => s.launchApp);
  const closeApp = useKernelStore((s) => s.closeApp);
  const focusApp = useKernelStore((s) => s.focusApp);
  const minimizeApp = useKernelStore((s) => s.minimizeApp);
  const restoreApp = useKernelStore((s) => s.restoreApp);
  const openWindow = useWindowStore((s) => s.open);
  const closeWindow = useWindowStore((s) => s.close);
  const focusWindow = useWindowStore((s) => s.focus);

  const launchApp = useCallback(
    (appId: string, title?: string) => {
      const appDef = kernel.apps.get(appId);
      if (!appDef) {
        log.error(`launchApp: "${appId}" not found in app registry`);
        return null;
      }

      // Open a window for this app
      const win = openWindow({
        processId: '', // will be set after process creation
        appId,
        title: title ?? appDef.title ?? appId,
        icon: appDef.icon,
      });

      // Launch the process
      log.info(`launchApp: "${appId}" → window ${win.id}`);
      const pid = launchProcess(appId, win.id);
      return pid;
    },
    [launchProcess, openWindow],
  );

  const closeAppWindow = useCallback(
    (processId: string) => {
      const win = useWindowStore.getState().getByProcessId(processId);
      if (win) closeWindow(win.id);
      closeApp(processId);
    },
    [closeWindow, closeApp],
  );

  const focusAppWindow = useCallback(
    (processId: string) => {
      const win = useWindowStore.getState().getByProcessId(processId);
      if (win) focusWindow(win.id);
      focusApp(processId);
    },
    [focusWindow, focusApp],
  );

  return {
    booted,
    processes,
    focusedProcessId,
    apps,
    launchApp,
    closeApp: closeAppWindow,
    focusApp: focusAppWindow,
    minimizeApp,
    restoreApp,
    checkPermission: (appId: string, perm: PermissionType) =>
      kernel.checkPermission(appId, perm),
    grantPermission: (appId: string, perm: PermissionType) =>
      kernel.grantPermission(appId, perm),
    registerApp: (app: Parameters<typeof kernel.registerApp>[0]) =>
      kernel.registerApp(app),
  };
}
