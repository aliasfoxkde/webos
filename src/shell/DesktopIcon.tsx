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
      className="flex flex-col items-center justify-center w-20 h-20 p-1 rounded-lg transition-all duration-150 select-none cursor-default"
      style={{
        backgroundColor: selected ? 'var(--os-accent-muted)' : 'transparent',
        transform: selected ? 'scale(1)' : 'scale(1)',
        boxShadow: selected
          ? 'inset 0 0 0 1.5px var(--os-accent)'
          : 'none',
      }}
      onClick={() => setSelected((s) => !s)}
      onDoubleClick={onDoubleClick}
      onBlur={() => setSelected(false)}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.transform = 'scale(1.04)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {icon ? (
        <span className="text-3xl mb-1 drop-shadow-lg">{icon}</span>
      ) : (
        <div
          className="w-10 h-10 rounded flex items-center justify-center mb-1"
          style={{ backgroundColor: 'var(--os-accent-muted)' }}
        >
          <svg
            className="w-6 h-6"
            style={{ color: 'var(--os-text-secondary)' }}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="4" y="2" width="16" height="20" rx="2" />
          </svg>
        </div>
      )}
      <span
        className="text-[11px] text-center leading-tight line-clamp-2 drop-shadow-md px-0.5"
        style={{
          color: 'var(--os-text-primary)',
          textShadow: selected ? 'none' : '0 1px 3px rgba(0,0,0,0.8)',
        }}
      >
        {name}
      </span>
    </button>
  );
}
