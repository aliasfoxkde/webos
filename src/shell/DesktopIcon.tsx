import React from 'react';

interface DesktopIconProps {
  name: string;
  icon?: string;
  onDoubleClick: () => void;
}

export function DesktopIcon({ name, icon, onDoubleClick }: DesktopIconProps) {
  const [selected, setSelected] = React.useState(false);

  return (
    <button
      className={`flex flex-col items-center justify-center w-20 h-20 p-1 rounded-lg
        transition-colors select-none
        ${selected ? 'bg-[var(--os-accent)]/20 ring-1 ring-[var(--os-accent)]' : 'hover:bg-white/10'}
      `}
      onClick={() => setSelected((s) => !s)}
      onDoubleClick={onDoubleClick}
      onBlur={() => setSelected(false)}
    >
      {icon ? (
        <span className="text-3xl mb-1">{icon}</span>
      ) : (
        <div className="w-10 h-10 rounded bg-[var(--os-accent)]/30 flex items-center justify-center mb-1">
          <svg className="w-6 h-6 text-[var(--os-text-secondary)]" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="2" width="16" height="20" rx="2" />
          </svg>
        </div>
      )}
      <span className="text-[11px] text-[var(--os-text-primary)] text-center leading-tight line-clamp-2 drop-shadow-md">
        {name}
      </span>
    </button>
  );
}
