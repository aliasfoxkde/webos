import { appRegistry } from '@/kernel/app-registry';

export interface AppListItem {
  id: string;
  name: string;
  icon: string;
}

/**
 * Get the list of apps for menus/search/desktop.
 * Reads from the app registry — single source of truth.
 */
export function getAppList(): AppListItem[] {
  return appRegistry.getAll().map((app) => ({
    id: app.id,
    name: app.title,
    icon: app.icon,
  }));
}
