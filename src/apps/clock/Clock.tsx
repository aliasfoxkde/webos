import { useState, useEffect, useCallback, useRef } from 'react';

type ClockTab = 'clock' | 'stopwatch' | 'timer';

const TABS: { id: ClockTab; label: string }[] = [
  { id: 'clock', label: 'Clock' },
  { id: 'stopwatch', label: 'Stopwatch' },
  { id: 'timer', label: 'Timer' },
];

function ClockView() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
      <div
        className="text-5xl font-bold tabular-nums tracking-wide"
        style={{ color: 'var(--os-text-primary)' }}
      >
        {time}
      </div>
      <div
        className="text-sm"
        style={{ color: 'var(--os-text-secondary)' }}
      >
        {date}
      </div>
    </div>
  );
}

function StopwatchView() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  const tick = useCallback(() => {
    setElapsedMs(Date.now() - startTimeRef.current);
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now() - elapsedMs;
      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(animFrameRef.current);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [running, tick, elapsedMs]);

  const start = useCallback(() => setRunning(true), []);
  const stop = useCallback(() => setRunning(false), []);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsedMs(0);
    setLaps([]);
  }, []);

  const lap = useCallback(() => {
    setLaps((prev) => [elapsedMs, ...prev]);
  }, [elapsedMs]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  };

  const btnClass =
    'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer';

  return (
    <div className="flex flex-1 flex-col items-center">
      {/* Display */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="text-4xl font-bold tabular-nums"
          style={{ color: 'var(--os-text-primary)' }}
        >
          {formatTime(elapsedMs)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 pb-2">
        {!running ? (
          <button
            className={btnClass}
            style={{
              backgroundColor: 'var(--os-accent)',
              color: '#ffffff',
            }}
            onClick={start}
          >
            {elapsedMs > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button
            className={btnClass}
            style={{
              backgroundColor: 'var(--os-bg-tertiary)',
              color: 'var(--os-text-primary)',
            }}
            onClick={stop}
          >
            Stop
          </button>
        )}
        {running && (
          <button
            className={btnClass}
            style={{
              backgroundColor: 'var(--os-bg-tertiary)',
              color: 'var(--os-text-primary)',
            }}
            onClick={lap}
          >
            Lap
          </button>
        )}
        {!running && elapsedMs > 0 && (
          <button
            className={btnClass}
            style={{
              backgroundColor: 'var(--os-bg-tertiary)',
              color: 'var(--os-text-primary)',
            }}
            onClick={reset}
          >
            Reset
          </button>
        )}
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="w-full flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-1">
            {laps.map((lapMs, i) => (
              <div
                key={i}
                className="flex justify-between items-center px-3 py-1.5 rounded-md"
                style={{ backgroundColor: 'var(--os-bg-secondary)' }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--os-text-secondary)' }}
                >
                  Lap {laps.length - i}
                </span>
                <span
                  className="text-xs font-mono"
                  style={{ color: 'var(--os-text-primary)' }}
                >
                  {formatTime(lapMs)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TimerView() {
  const [inputMinutes, setInputMinutes] = useState(5);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const endTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  const totalInputMs = (inputMinutes * 60 + inputSeconds) * 1000;

  const tick = useCallback(() => {
    const remaining = endTimeRef.current - Date.now();
    if (remaining <= 0) {
      setRemainingMs(0);
      setRunning(false);
      setFinished(true);
      cancelAnimationFrame(animFrameRef.current);
      return;
    }
    setRemainingMs(remaining);
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (running) {
      endTimeRef.current = Date.now() + remainingMs;
      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(animFrameRef.current);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [running, tick, remainingMs]);

  const start = useCallback(() => {
    if (remainingMs <= 0) {
      setRemainingMs(totalInputMs);
    }
    setRunning(true);
    setFinished(false);
  }, [remainingMs, totalInputMs]);

  const pause = useCallback(() => setRunning(false), []);

  const reset = useCallback(() => {
    setRunning(false);
    setRemainingMs(0);
    setFinished(false);
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const btnClass =
    'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer';

  return (
    <div className="flex flex-1 flex-col items-center">
      {/* Display */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className={`text-5xl font-bold tabular-nums ${finished ? 'animate-pulse' : ''}`}
          style={{ color: finished ? 'var(--os-error)' : 'var(--os-text-primary)' }}
        >
          {remainingMs > 0 || running
            ? formatTime(remainingMs)
            : formatTime(totalInputMs)}
        </div>
      </div>

      {/* Input (only when not running) */}
      {!running && remainingMs <= 0 && (
        <div className="flex items-center gap-2 pb-4">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={99}
              value={inputMinutes}
              onChange={(e) => setInputMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-14 rounded-lg border px-2 py-1.5 text-center text-lg outline-none tabular-nums"
              style={{
                borderColor: 'var(--os-border)',
                backgroundColor: 'var(--os-bg-tertiary)',
                color: 'var(--os-text-primary)',
              }}
            />
            <span className="text-sm" style={{ color: 'var(--os-text-secondary)' }}>min</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={59}
              value={inputSeconds}
              onChange={(e) => setInputSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-14 rounded-lg border px-2 py-1.5 text-center text-lg outline-none tabular-nums"
              style={{
                borderColor: 'var(--os-border)',
                backgroundColor: 'var(--os-bg-tertiary)',
                color: 'var(--os-text-primary)',
              }}
            />
            <span className="text-sm" style={{ color: 'var(--os-text-secondary)' }}>sec</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 pb-4">
        {!running ? (
          <button
            className={btnClass}
            style={{
              backgroundColor: 'var(--os-accent)',
              color: '#ffffff',
            }}
            onClick={start}
            disabled={totalInputMs <= 0 && remainingMs <= 0}
          >
            {remainingMs > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button
            className={btnClass}
            style={{
              backgroundColor: 'var(--os-bg-tertiary)',
              color: 'var(--os-text-primary)',
            }}
            onClick={pause}
          >
            Pause
          </button>
        )}
        {(remainingMs > 0 || finished) && !running && (
          <button
            className={btnClass}
            style={{
              backgroundColor: 'var(--os-bg-tertiary)',
              color: 'var(--os-text-primary)',
            }}
            onClick={reset}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export function Clock() {
  const [activeTab, setActiveTab] = useState<ClockTab>('clock');

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
    >
      {/* Tab bar */}
      <div
        className="flex items-center gap-4 border-b px-4 py-2"
        style={{
          backgroundColor: 'var(--os-bg-secondary)',
          borderColor: 'var(--os-border)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-1 py-1 text-sm font-medium transition-colors"
            style={{
              color:
                activeTab === tab.id
                  ? 'var(--os-accent-light)'
                  : 'var(--os-text-secondary)',
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: 'var(--os-accent)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'clock' && <ClockView />}
        {activeTab === 'stopwatch' && <StopwatchView />}
        {activeTab === 'timer' && <TimerView />}
      </div>
    </div>
  );
}
