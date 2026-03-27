export { kernel } from './kernel';
export { eventBus, EventBus } from './event-bus';
export { processManager, ProcessManager } from './process-manager';
export { appRegistry, AppRegistry } from './app-registry';
export { permissionManager, PermissionManager } from './permissions';
export type {
  AppDefinition,
  Process,
  ProcessState,
  WindowState,
  PermissionType,
  SystemEventType,
  SystemEvent,
  SystemEventPayload,
  EventHandler,
  Unsubscribe,
} from './types';
