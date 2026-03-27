import type { ComponentType } from 'react';

// Process states
export type ProcessState = 'launching' | 'running' | 'minimized' | 'closing' | 'crashed';

// Window states
export type WindowState = 'normal' | 'minimized' | 'maximized' | 'fullscreen';

// Permission types
export type PermissionType =
  | 'filesystem:read'
  | 'filesystem:write'
  | 'network'
  | 'clipboard:read'
  | 'clipboard:write'
  | 'notifications'
  | 'microphone'
  | 'camera'
  | 'geolocation';

// App definition (registered in app registry)
export interface AppDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  component?: () => Promise<ComponentType>;
  defaultWindow: {
    width: number;
    height: number;
    minWidth?: number;
    minHeight?: number;
    resizable?: boolean;
    maximizable?: boolean;
  };
  fileAssociations?: string[]; // MIME types this app can open
  permissions: PermissionType[];
  singleton?: boolean; // Only one instance allowed
  systemApp?: boolean; // Cannot be uninstalled
}

// Running process
export interface Process {
  id: string;
  appId: string;
  windowId: string;
  state: ProcessState;
  startedAt: number;
  focusedAt: number | null;
  metadata?: Record<string, unknown>;
}

// System event types
export type SystemEventType =
  | 'app:launch'
  | 'app:close'
  | 'app:focus'
  | 'app:minimize'
  | 'app:restore'
  | 'app:crash'
  | 'file:create'
  | 'file:delete'
  | 'file:update'
  | 'file:move'
  | 'file:copy'
  | 'window:open'
  | 'window:close'
  | 'window:focus'
  | 'window:minimize'
  | 'window:maximize'
  | 'window:restore'
  | 'window:fullscreen'
  | 'theme:change'
  | 'vfs:ready'
  | 'kernel:boot'
  | 'kernel:shutdown'
  | 'notification:show';

// Event payload map
export interface SystemEventPayloadMap {
  'app:launch': { processId: string; appId: string };
  'app:close': { processId: string; appId: string };
  'app:focus': { processId: string; appId: string };
  'app:minimize': { processId: string; appId: string };
  'app:restore': { processId: string; appId: string };
  'app:crash': { processId: string; appId: string; error: Error };
  'file:create': { path: string; type: 'file' | 'folder' };
  'file:delete': { path: string };
  'file:update': { path: string };
  'file:move': { from: string; to: string };
  'file:copy': { from: string; to: string };
  'window:open': { windowId: string; appId: string };
  'window:close': { windowId: string };
  'window:focus': { windowId: string };
  'window:minimize': { windowId: string };
  'window:maximize': { windowId: string };
  'window:restore': { windowId: string };
  'window:fullscreen': { windowId: string; fullscreen: boolean };
  'theme:change': { theme: string };
  'vfs:ready': {};
  'kernel:boot': {};
  'kernel:shutdown': {};
  'notification:show': { title: string; body?: string };
}

export type SystemEventPayload<T extends SystemEventType> = SystemEventPayloadMap[T];

export interface SystemEvent<T extends SystemEventType = SystemEventType> {
  type: T;
  payload: SystemEventPayload<T>;
  timestamp: number;
}

// Event handler type
export type EventHandler<T extends SystemEventType = SystemEventType> = (
  event: SystemEvent<T>,
) => void;

// Unsubscribe function
export type Unsubscribe = () => void;
