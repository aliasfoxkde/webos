import { useEffect } from 'react';
import { useWindowStore } from '@/wm/window-store';
import { useKernelStore } from '@/stores/kernel-store';
import { kernel } from '@/kernel/kernel';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts?: ShortcutConfig[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const allShortcuts: ShortcutConfig[] = [
        // Built-in shortcuts
        {
          key: 'F4',
          alt: true,
          action: () => {
            const active = useWindowStore.getState().getActive();
            if (active) useWindowStore.getState().close(active.id);
          },
          description: 'Close active window',
        },
        {
          key: 'Tab',
          alt: true,
          action: () => {
            e.preventDefault();
            const windows = useWindowStore.getState().windows.filter((w) => !w.isMinimized);
            const active = useWindowStore.getState().getActive();
            if (!windows.length) return;

            const currentIdx = active ? windows.findIndex((w) => w.id === active.id) : -1;
            const nextIdx = (currentIdx + 1) % windows.length;
            useWindowStore.getState().focus(windows[nextIdx].id);
          },
          description: 'Cycle windows',
        },
        {
          key: 'd',
          meta: true,
          action: () => {
            // Minimize all windows
            useWindowStore.getState().windows.forEach((w) => {
              useWindowStore.getState().minimize(w.id);
            });
          },
          description: 'Show desktop',
        },
        {
          key: 'Escape',
          ctrl: true,
          shift: true,
          action: () => {
            const appDef = kernel.apps.get('task-manager');
            if (!appDef) return;
            const win = useWindowStore.getState().open({
              processId: '',
              appId: 'task-manager',
              title: appDef.title ?? 'Task Manager',
              icon: appDef.icon,
              bounds: appDef.defaultWindow
                ? { width: appDef.defaultWindow.width, height: appDef.defaultWindow.height }
                : undefined,
            });
            useKernelStore.getState().launchApp('task-manager', win.id);
          },
          description: 'Open task manager',
        },
        // User-provided shortcuts
        ...(shortcuts ?? []),
      ];

      for (const shortcut of allShortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const metaMatch = shortcut.meta ? e.metaKey : true;

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          altMatch &&
          shiftMatch &&
          metaMatch
        ) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
