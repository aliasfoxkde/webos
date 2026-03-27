import React from 'react';

export function Clock() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dateStr = time.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className="text-xs text-right leading-tight pl-2"
      style={{
        color: 'var(--os-text-secondary)',
        borderLeft: '1px solid var(--os-taskbar-border)',
      }}
    >
      <div>{timeStr}</div>
      <div className="text-[10px]" style={{ color: 'var(--os-text-muted)' }}>
        {dateStr}
      </div>
    </div>
  );
}
