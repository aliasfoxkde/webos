import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '@/kernel/event-bus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('on/emit', () => {
    it('should call handler when event is emitted', () => {
      const handler = vi.fn();
      bus.on('app:launch', handler);
      bus.emit('app:launch', { processId: 'p1', appId: 'test' });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should pass event object to handler', () => {
      const handler = vi.fn();
      bus.on('file:create', handler);
      bus.emit('file:create', { path: '/test.txt', type: 'file' });
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'file:create',
          payload: { path: '/test.txt', type: 'file' },
        }),
      );
    });

    it('should call multiple handlers for the same event', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      bus.on('app:close', h1);
      bus.on('app:close', h2);
      bus.emit('app:close', { processId: 'p1', appId: 'test' });
      expect(h1).toHaveBeenCalledTimes(1);
      expect(h2).toHaveBeenCalledTimes(1);
    });

    it('should not call handlers for different event types', () => {
      const handler = vi.fn();
      bus.on('app:launch', handler);
      bus.emit('app:close', { processId: 'p1', appId: 'test' });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should stop receiving events after unsubscribe', () => {
      const handler = vi.fn();
      const unsub = bus.on('app:launch', handler);
      bus.emit('app:launch', { processId: 'p1', appId: 'test' });
      expect(handler).toHaveBeenCalledTimes(1);
      unsub();
      bus.emit('app:launch', { processId: 'p1', appId: 'test' });
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('once', () => {
    it('should only fire handler once', () => {
      const handler = vi.fn();
      bus.once('app:launch', handler);
      bus.emit('app:launch', { processId: 'p1', appId: 'test' });
      bus.emit('app:launch', { processId: 'p1', appId: 'test' });
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('onAny (wildcard)', () => {
    it('should receive all events', () => {
      const handler = vi.fn();
      bus.onAny(handler);
      bus.emit('app:launch', { processId: 'p1', appId: 'test' });
      bus.emit('file:create', { path: '/test.txt', type: 'file' });
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should unsubscribe from wildcard', () => {
      const handler = vi.fn();
      const unsub = bus.onAny(handler);
      bus.emit('app:launch', { processId: 'p1', appId: 'test' });
      unsub();
      bus.emit('app:launch', { processId: 'p1', appId: 'test' });
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('off', () => {
    it('should remove all handlers for a type', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      bus.on('app:launch', h1);
      bus.on('app:launch', h2);
      bus.off('app:launch');
      bus.emit('app:launch', { processId: 'p1', appId: 'test' });
      expect(h1).not.toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should remove all handlers', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      bus.on('app:launch', h1);
      bus.on('file:create', h2);
      bus.clear();
      bus.emit('app:launch', { processId: 'p1', appId: 'test' });
      bus.emit('file:create', { path: '/test', type: 'file' });
      expect(h1).not.toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('should return correct count', () => {
      bus.on('app:launch', vi.fn());
      bus.on('app:launch', vi.fn());
      bus.onAny(vi.fn());
      expect(bus.listenerCount('app:launch')).toBe(3);
      expect(bus.listenerCount('file:create')).toBe(1);
    });
  });
});
