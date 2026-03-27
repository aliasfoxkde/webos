import React from 'react';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const parts = path === '/' ? [''] : path.split('/');

  return (
    <div className="flex items-center gap-0.5 text-xs min-w-0">
      <button
        className="text-[var(--os-text-secondary)] hover:text-[var(--os-text-primary)] px-1 shrink-0"
        onClick={() => onNavigate('/')}
      >
        ⊞
      </button>
      {parts.map((part, i) => {
        if (i === 0 && part === '') return null;
        const segmentPath = '/' + parts.slice(1, i + 1).join('/');
        return (
          <React.Fragment key={segmentPath}>
            <span className="text-[var(--os-text-muted)] shrink-0">/</span>
            <button
              className="text-[var(--os-text-secondary)] hover:text-[var(--os-text-primary)] px-1 truncate max-w-[120px]"
              onClick={() => onNavigate(segmentPath)}
              title={segmentPath}
            >
              {part}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
