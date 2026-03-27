import type { Process, ProcessState, AppDefinition } from './types';
import { eventBus } from './event-bus';
import { createLogger } from '@/lib/logger';

const log = createLogger('process-mgr');

let processCounter = 0;
let focusCounter = 0;

function generateProcessId(): string {
  return `proc-${++processCounter}-${Date.now().toString(36)}`;
}

function nextFocusTime(): number {
  return Date.now() + (++focusCounter * 0.001);
}

/**
 * Manages application processes (launch, focus, minimize, close, crash).
 */
export class ProcessManager {
  private processes = new Map<string, Process>();

  /**
   * Launch a new process for an app.
   */
  launch(app: AppDefinition, windowId: string): Process {
    // Check singleton constraint
    if (app.singleton) {
      const existing = this.findByAppId(app.id);
      if (existing) {
        log.info(`Singleton "${app.id}" already running (${existing.id}), focusing`);
        this.focus(existing.id);
        return existing;
      }
    }

    const process: Process = {
      id: generateProcessId(),
      appId: app.id,
      windowId,
      state: 'launching',
      startedAt: Date.now(),
      focusedAt: null,
    };

    this.processes.set(process.id, process);
    log.debug(`Process created: ${process.id} for "${app.id}"`);
    eventBus.emit('app:launch', { processId: process.id, appId: app.id });

    // Transition to running after launch
    process.state = 'running';
    this.focus(process.id);

    return process;
  }

  /**
   * Focus a process (bring to front).
   */
  focus(processId: string): void {
    const proc = this.processes.get(processId);
    if (!proc || proc.state === 'closing') return;

    proc.focusedAt = nextFocusTime();
    if (proc.state === 'minimized') {
      proc.state = 'running';
    }
    eventBus.emit('app:focus', { processId: proc.id, appId: proc.appId });
  }

  /**
   * Minimize a process.
   */
  minimize(processId: string): void {
    const proc = this.processes.get(processId);
    if (!proc) return;

    proc.state = 'minimized';
    eventBus.emit('app:minimize', { processId: proc.id, appId: proc.appId });
  }

  /**
   * Restore a minimized process.
   */
  restore(processId: string): void {
    const proc = this.processes.get(processId);
    if (!proc) return;

    proc.state = 'running';
    proc.focusedAt = nextFocusTime();
    eventBus.emit('app:restore', { processId: proc.id, appId: proc.appId });
  }

  /**
   * Close a process.
   */
  close(processId: string): void {
    const proc = this.processes.get(processId);
    if (!proc) {
      log.warn(`close: process ${processId} not found`);
      return;
    }

    log.info(`Closing process ${processId} ("${proc.appId}")`);
    proc.state = 'closing';
    eventBus.emit('app:close', { processId: proc.id, appId: proc.appId });
    this.processes.delete(processId);
  }

  /**
   * Mark a process as crashed.
   */
  crash(processId: string, error: Error): void {
    const proc = this.processes.get(processId);
    if (!proc) return;

    log.error(`Process ${processId} ("${proc.appId}") crashed: ${error.message}`);
    proc.state = 'crashed';
    eventBus.emit('app:crash', { processId: proc.id, appId: proc.appId, error });
  }

  /**
   * Get a process by ID.
   */
  get(processId: string): Process | undefined {
    return this.processes.get(processId);
  }

  /**
   * Find a process by app ID.
   */
  findByAppId(appId: string): Process | undefined {
    for (const proc of this.processes.values()) {
      if (proc.appId === appId && proc.state !== 'closing') return proc;
    }
    return undefined;
  }

  /**
   * Get all running processes.
   */
  getAll(): Process[] {
    return Array.from(this.processes.values());
  }

  /**
   * Get the currently focused process.
   */
  getFocused(): Process | undefined {
    let latest: Process | undefined;
    for (const proc of this.processes.values()) {
      if (proc.state === 'running' && proc.focusedAt !== null) {
        if (!latest || (proc.focusedAt !== null && latest.focusedAt !== null && proc.focusedAt > latest.focusedAt)) {
          latest = proc;
        }
      }
    }
    return latest;
  }

  /**
   * Get process count by state.
   */
  countByState(state?: ProcessState): number {
    if (state) {
      let count = 0;
      for (const proc of this.processes.values()) {
        if (proc.state === state) count++;
      }
      return count;
    }
    return this.processes.size;
  }

  /**
   * Reset process counter (for tests).
   */
  reset(): void {
    this.processes.clear();
    processCounter = 0;
    focusCounter = 0;
  }
}

// Singleton instance
export const processManager = new ProcessManager();
