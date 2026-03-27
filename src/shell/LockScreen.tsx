import { useState, useEffect } from 'react';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [time, setTime] = useState(new Date());
  const [slideUp, setSlideUp] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleClick = () => {
    if (!slideUp) {
      setSlideUp(true);
    }
  };

  const handleUnlock = () => {
    onUnlock();
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex flex-col items-center justify-center cursor-pointer select-none"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
      }}
      onClick={handleClick}
    >
      <div
        className="flex flex-col items-center transition-all duration-500"
        style={{
          transform: slideUp ? 'translateY(-60px)' : 'translateY(0)',
        }}
      >
        {/* Time */}
        <div
          className="text-8xl font-extralight tracking-tight"
          style={{ color: 'var(--os-text-primary)', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          {hours}:{minutes}
        </div>

        {/* Date */}
        <div
          className="mt-2 text-lg font-light"
          style={{ color: 'var(--os-text-secondary)' }}
        >
          {dateStr}
        </div>

        {/* Avatar */}
        <div
          className="mt-10 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-medium text-white"
          style={{ backgroundColor: 'var(--os-accent)' }}
        >
          U
        </div>

        {/* Unlock prompt */}
        {slideUp && (
          <button
            className="mt-4 rounded-lg px-8 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: 'var(--os-accent)' }}
            onClick={(e) => {
              e.stopPropagation();
              handleUnlock();
            }}
          >
            Sign In
          </button>
        )}

        {!slideUp && (
          <div
            className="mt-8 text-sm"
            style={{ color: 'var(--os-text-muted)' }}
          >
            Click anywhere to unlock
          </div>
        )}
      </div>
    </div>
  );
}
