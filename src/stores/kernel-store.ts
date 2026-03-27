import { create } from 'zustand';
import type { Process, AppDefinition } from '@/kernel/types';
import { kernel } from '@/kernel/kernel';
import { eventBus } from '@/kernel/event-bus';

interface KernelState {
  booted: boolean;
  processes: Process[];
  focusedProcessId: string | null;
  apps: AppDefinition[];

  // Actions
  boot: () => void;
  launchApp: (appId: string, windowId: string) => string | null;
  closeApp: (processId: string) => void;
  focusApp: (processId: string) => void;
  minimizeApp: (processId: string) => void;
  restoreApp: (processId: string) => void;
  refreshProcesses: () => void;
  refreshApps: () => void;
}

export const useKernelStore = create<KernelState>((set, get) => ({
  booted: false,
  processes: [],
  focusedProcessId: null,
  apps: [],

  boot: () => {
    kernel.boot();
    set({ booted: true });

    // Subscribe to process events to keep store in sync
    eventBus.onAny(() => {
      get().refreshProcesses();
    });
    get().refreshApps();
  },

  launchApp: (appId, windowId) => {
    const pid = kernel.launchApp(appId, windowId);
    get().refreshProcesses();
    return pid;
  },

  closeApp: (processId) => {
    kernel.closeApp(processId);
    get().refreshProcesses();
  },

  focusApp: (processId) => {
    kernel.focusApp(processId);
    set({ focusedProcessId: processId });
  },

  minimizeApp: (processId) => {
    kernel.processes.minimize(processId);
    get().refreshProcesses();
  },

  restoreApp: (processId) => {
    kernel.processes.restore(processId);
    get().refreshProcesses();
  },

  refreshProcesses: () => {
    const processes = kernel.processes.getAll();
    const focused = kernel.processes.getFocused();
    set({
      processes,
      focusedProcessId: focused?.id ?? null,
    });
  },

  refreshApps: () => {
    set({ apps: kernel.apps.getAll() });
  },
}));
