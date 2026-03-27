import { useState, useEffect, useCallback } from 'react';
import { useKernelStore } from '@/stores/kernel-store';
import { useWindowStore } from '@/wm/window-store';

export function TaskManager() {
  const processes = useKernelStore((s) => s.processes);
  const refreshProcesses = useKernelStore((s) => s.refreshProcesses);
  const closeApp = useKernelStore((s) => s.closeApp);
  const windows = useWindowStore((s) => s.windows);
  const closeWindow = useWindowStore((s) => s.close);
  const [lastRefresh, setLastRefresh] = useState(0);

  // Auto-refresh every 2 seconds
  useEffect(() => {
    refreshProcesses();
    setLastRefresh(Date.now());

    const interval = setInterval(() => {
      refreshProcesses();
      setLastRefresh(Date.now());
    }, 2000);

    return () => clearInterval(interval);
  }, [refreshProcesses]);

  const killProcess = useCallback(
    (processId: string, windowId: string) => {
      closeWindow(windowId);
      closeApp(processId);
    },
    [closeApp, closeWindow],
  );

  const formatUptime = (startedAt: number): string => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    if (elapsed < 60) return `${elapsed}s`;
    if (elapsed < 3600) {
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      return `${m}m ${s}s`;
    }
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const stateColor = (state: string) => {
    switch (state) {
      case 'running':
        return 'var(--os-success)';
      case 'launching':
        return 'var(--os-warning)';
      case 'minimized':
        return 'var(--os-text-muted)';
      case 'closing':
        return 'var(--os-warning)';
      case 'crashed':
        return 'var(--os-error)';
      default:
        return 'var(--os-text-secondary)';
    }
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-2"
        style={{
          backgroundColor: 'var(--os-bg-secondary)',
          borderColor: 'var(--os-border)',
        }}
      >
        <h2
          className="text-sm font-semibold"
          style={{ color: 'var(--os-text-primary)' }}
        >
          Task Manager
        </h2>
        <div className="flex items-center gap-3">
          <span
            className="text-xs"
            style={{ color: 'var(--os-text-muted)' }}
          >
            {processes.length} process{processes.length !== 1 ? 'es' : ''}
          </span>
          <span
            className="text-xs tabular-nums"
            style={{ color: 'var(--os-text-muted)' }}
          >
            Updated {formatUptime(lastRefresh)} ago
          </span>
          <button
            onClick={() => {
              refreshProcesses();
              setLastRefresh(Date.now());
            }}
            className="rounded px-2 py-0.5 text-xs hover:bg-[var(--os-bg-hover)]"
            style={{ color: 'var(--os-accent)' }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr
              className="border-b text-left"
              style={{
                backgroundColor: 'var(--os-bg-secondary)',
                borderColor: 'var(--os-border)',
                color: 'var(--os-text-muted)',
              }}
            >
              <th className="px-4 py-2 font-medium">App ID</th>
              <th className="px-4 py-2 font-medium">Process ID</th>
              <th className="px-4 py-2 font-medium">State</th>
              <th className="px-4 py-2 font-medium">Window</th>
              <th className="px-4 py-2 font-medium">Uptime</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {processes.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center"
                  style={{ color: 'var(--os-text-muted)' }}
                >
                  No running processes
                </td>
              </tr>
            ) : (
              processes.map((proc) => {
                const win = windows.find((w) => w.processId === proc.id);
                return (
                  <tr
                    key={proc.id}
                    className="border-b transition-colors hover:bg-[var(--os-bg-hover)]"
                    style={{ borderColor: 'var(--os-border)' }}
                  >
                    <td
                      className="px-4 py-2 font-mono"
                      style={{ color: 'var(--os-text-primary)' }}
                    >
                      {proc.appId}
                    </td>
                    <td
                      className="px-4 py-2 font-mono"
                      style={{ color: 'var(--os-text-secondary)' }}
                    >
                      <span className="truncate" title={proc.id}>
                        {proc.id.length > 12
                          ? `${proc.id.slice(0, 8)}...${proc.id.slice(-4)}`
                          : proc.id}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                        style={{
                          color: stateColor(proc.state),
                          backgroundColor: `${stateColor(proc.state)}15`,
                        }}
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: stateColor(proc.state),
                          }}
                        />
                        {proc.state}
                      </span>
                    </td>
                    <td
                      className="px-4 py-2"
                      style={{ color: 'var(--os-text-secondary)' }}
                    >
                      {win ? (
                        <span className="truncate" title={win.title}>
                          {win.title}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--os-text-muted)' }}>
                          -
                        </span>
                      )}
                    </td>
                    <td
                      className="px-4 py-2 tabular-nums"
                      style={{ color: 'var(--os-text-secondary)' }}
                    >
                      {formatUptime(proc.startedAt)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => killProcess(proc.id, proc.windowId)}
                        className="rounded px-2 py-0.5 text-xs font-medium transition-colors hover:bg-[var(--os-error)] hover:text-white"
                        style={{ color: 'var(--os-error)' }}
                      >
                        Kill
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
