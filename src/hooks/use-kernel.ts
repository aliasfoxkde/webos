import { useKernelStore } from '@/stores/kernel-store';
import { kernel } from '@/kernel/kernel';
import type { PermissionType } from '@/kernel/types';

/**
 * Hook to access kernel from components.
 */
export function useKernel() {
  const { booted, processes, focusedProcessId, apps } = useKernelStore();
  const launchApp = useKernelStore((s) => s.launchApp);
  const closeApp = useKernelStore((s) => s.closeApp);
  const focusApp = useKernelStore((s) => s.focusApp);
  const minimizeApp = useKernelStore((s) => s.minimizeApp);
  const restoreApp = useKernelStore((s) => s.restoreApp);

  return {
    booted,
    processes,
    focusedProcessId,
    apps,
    launchApp,
    closeApp,
    focusApp,
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
