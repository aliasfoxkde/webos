import { useState, useEffect } from 'react';
import { useWindowStore } from '@/wm/window-store';

type Tab = 'processes' | 'performance' | 'storage';

export function SystemMonitor() {
  const [tab, setTab] = useState<Tab>('processes');
  const [fps, setFps] = useState(0);
  const [tick, setTick] = useState(0);

  // FPS counter
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf: number;
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(frames);
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Refresh tick every 2 seconds
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const windows = useWindowStore((s) => s.windows);
  const activeId = useWindowStore((s) => s.getActive?.()?.id);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'processes', label: 'Processes' },
    { id: 'performance', label: 'Performance' },
    { id: 'storage', label: 'Storage' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--os-bg-primary)] text-[var(--os-text-primary)]">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--os-border)] bg-[var(--os-bg-secondary)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`px-4 py-2 text-xs ${
              tab === t.id
                ? 'border-b-2 border-[var(--os-accent)] text-[var(--os-accent)]'
                : 'text-[var(--os-text-secondary)] hover:text-[var(--os-text-primary)]'
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {tab === 'processes' && (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[var(--os-text-muted)] border-b border-[var(--os-border)]">
                <th className="pb-1 pr-3">Title</th>
                <th className="pb-1 pr-3">App</th>
                <th className="pb-1 pr-3">Status</th>
                <th className="pb-1">Size</th>
              </tr>
            </thead>
            <tbody>
              {windows.map((w) => (
                <tr key={w.id} className="border-b border-[var(--os-border)] border-opacity-30">
                  <td className="py-1 pr-3">{w.title}</td>
                  <td className="py-1 pr-3">{w.appId}</td>
                  <td className="py-1 pr-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      w.isMinimized
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : w.id === activeId
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {w.isMinimized ? 'Min' : 'Active'}
                    </span>
                  </td>
                  <td className="py-1 text-[var(--os-text-muted)]">
                    {w.bounds.width}x{w.bounds.height}
                  </td>
                </tr>
              ))}
              {windows.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-[var(--os-text-muted)]">No running processes</td></tr>
              )}
            </tbody>
          </table>
        )}

        {tab === 'performance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[var(--os-bg-secondary)]">
                <div className="text-[10px] text-[var(--os-text-muted)] mb-1">Frame Rate</div>
                <div className="text-lg font-mono">{fps} <span className="text-xs text-[var(--os-text-muted)]">FPS</span></div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--os-bg-secondary)]">
                <div className="text-[10px] text-[var(--os-text-muted)] mb-1">Open Windows</div>
                <div className="text-lg font-mono">{windows.length}</div>
              </div>
            </div>
            {typeof (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory !== 'undefined' && (() => {
              const mem = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory!;
              return (
                <div className="p-3 rounded-lg bg-[var(--os-bg-secondary)]">
                  <div className="text-[10px] text-[var(--os-text-muted)] mb-1">JS Heap</div>
                  <div className="text-sm font-mono">
                    {(mem.usedJSHeapSize / 1048576).toFixed(1)} / {(mem.jsHeapSizeLimit / 1048576).toFixed(0)} MB
                  </div>
                  <div className="mt-1 h-2 bg-[var(--os-bg-primary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--os-accent)] rounded-full transition-all"
                      style={{ width: `${(mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })()}
            {'deviceMemory' in navigator && (navigator as unknown as { deviceMemory: number }).deviceMemory && (
              <div className="p-3 rounded-lg bg-[var(--os-bg-secondary)]">
                <div className="text-[10px] text-[var(--os-text-muted)] mb-1">Device Memory</div>
                <div className="text-lg font-mono">{(navigator as unknown as { deviceMemory: number }).deviceMemory} GB</div>
              </div>
            )}
            <div className="p-3 rounded-lg bg-[var(--os-bg-secondary)]">
              <div className="text-[10px] text-[var(--os-text-muted)] mb-1">Refresh</div>
              <div className="text-xs text-[var(--os-text-muted)]">Auto-refreshing every 2s (tick: {tick})</div>
            </div>
          </div>
        )}

        {tab === 'storage' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[var(--os-bg-secondary)]">
              <div className="text-[10px] text-[var(--os-text-muted)] mb-1">Virtual File System</div>
              <div className="text-sm">All files stored in browser IndexedDB</div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--os-bg-secondary)]">
              <div className="text-[10px] text-[var(--os-text-muted)] mb-1">Window Count</div>
              <div className="text-lg font-mono">{windows.length}</div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--os-bg-secondary)]">
              <div className="text-[10px] text-[var(--os-text-muted)] mb-1">Platform</div>
              <div className="text-sm">{navigator.platform}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
