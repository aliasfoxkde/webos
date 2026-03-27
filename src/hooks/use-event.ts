import { useEffect } from 'react';
import { eventBus } from '@/kernel/event-bus';
import type { SystemEventType, EventHandler } from '@/kernel/types';

/**
 * Hook to subscribe to kernel events.
 */
export function useEvent<T extends SystemEventType>(
  type: T,
  handler: EventHandler<T>,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    const unsub = eventBus.on(type, handler);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, ...deps]);
}
