import React from 'react';

export function Clock() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="text-xs text-[var(--os-text-secondary)] text-right leading-tight">
      <div>{timeStr}</div>
      <div>{dateStr}</div>
    </div>
  );
}
