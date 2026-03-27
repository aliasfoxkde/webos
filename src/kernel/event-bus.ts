import type {
  SystemEventType,
  SystemEvent,
  EventHandler,
  Unsubscribe,
  SystemEventPayload,
} from './types';

type HandlerEntry = {
  handler: EventHandler;
  once: boolean;
};

/**
 * Typed event bus for inter-system communication.
 * Supports subscribe, once, emit, and wildcard listeners.
 */
export class EventBus {
  private handlers = new Map<SystemEventType, HandlerEntry[]>();
  private wildcardHandlers: HandlerEntry[] = [];

  /**
   * Subscribe to an event type.
   * Returns an unsubscribe function.
   */
  on<T extends SystemEventType>(type: T, handler: EventHandler<T>): Unsubscribe {
    return this.addListener(type, handler as EventHandler, false);
  }

  /**
   * Subscribe to an event type, but only fire once.
   * Returns an unsubscribe function.
   */
  once<T extends SystemEventType>(type: T, handler: EventHandler<T>): Unsubscribe {
    return this.addListener(type, handler as EventHandler, true);
  }

  /**
   * Subscribe to ALL events (wildcard).
   * Returns an unsubscribe function.
   */
  onAny(handler: EventHandler): Unsubscribe {
    const entry: HandlerEntry = { handler, once: false };
    this.wildcardHandlers.push(entry);
    return () => {
      const idx = this.wildcardHandlers.indexOf(entry);
      if (idx >= 0) this.wildcardHandlers.splice(idx, 1);
    };
  }

  /**
   * Emit an event with payload.
   */
  emit<T extends SystemEventType>(type: T, payload: SystemEventPayload<T>): void {
    const event: SystemEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    // Type-specific handlers
    const handlers = this.handlers.get(type);
    if (handlers) {
      const toRemove: number[] = [];
      for (let i = 0; i < handlers.length; i++) {
        const entry = handlers[i]!;
        entry.handler(event as SystemEvent);
        if (entry.once) toRemove.push(i);
      }
      // Remove one-shot handlers in reverse order
      for (let i = toRemove.length - 1; i >= 0; i--) {
        handlers.splice(toRemove[i]!, 1);
      }
      if (handlers.length === 0) {
        this.handlers.delete(type);
      }
    }

    // Wildcard handlers
    const toRemoveWildcard: number[] = [];
    for (let i = 0; i < this.wildcardHandlers.length; i++) {
      const entry = this.wildcardHandlers[i]!;
      entry.handler(event as SystemEvent);
      if (entry.once) toRemoveWildcard.push(i);
    }
    for (let i = toRemoveWildcard.length - 1; i >= 0; i--) {
      this.wildcardHandlers.splice(toRemoveWildcard[i]!, 1);
    }
  }

  /**
   * Remove all handlers for a specific event type.
   */
  off(type: SystemEventType): void {
    this.handlers.delete(type);
  }

  /**
   * Remove all handlers (all types + wildcard).
   */
  clear(): void {
    this.handlers.clear();
    this.wildcardHandlers = [];
  }

  /**
   * Get the number of listeners for a specific event type.
   */
  listenerCount(type: SystemEventType): number {
    return (this.handlers.get(type)?.length ?? 0) + this.wildcardHandlers.length;
  }

  private addListener(type: SystemEventType, handler: EventHandler, once: boolean): Unsubscribe {
    let handlers = this.handlers.get(type);
    if (!handlers) {
      handlers = [];
      this.handlers.set(type, handlers);
    }
    const entry: HandlerEntry = { handler, once };
    handlers.push(entry);
    return () => {
      const idx = handlers!.indexOf(entry);
      if (idx >= 0) handlers!.splice(idx, 1);
    };
  }
}

// Singleton instance
export const eventBus = new EventBus();
