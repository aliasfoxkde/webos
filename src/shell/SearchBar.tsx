import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useKernel } from '@/hooks/use-kernel';
import { getAppList } from './app-list';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { launchApp } = useKernel();

  const appList = useMemo(() => getAppList(), []);

  const filtered = useMemo(
    () =>
      query
        ? appList.filter((app) =>
            app.name.toLowerCase().includes(query.toLowerCase()),
          )
        : [],
    [query, appList],
  );

  const open = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (appId: string, _name: string) => {
      launchApp(appId, _name);
      close();
    },
    [launchApp, close],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && selectedIndex >= 0 && filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].id, filtered[selectedIndex].name);
      }
    },
    [filtered, selectedIndex, handleSelect, close],
  );

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  // Ctrl+K / Cmd+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) close();
        else open();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, open, close]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={isOpen ? close : open}
        className="flex items-center h-7 px-2 rounded-md text-xs transition-colors"
        style={{
          backgroundColor: isOpen
            ? 'var(--os-bg-tertiary)'
            : 'transparent',
          color: 'var(--os-text-muted)',
          border: isOpen ? '1px solid var(--os-border)' : '1px solid transparent',
        }}
        title="Search apps (Ctrl+K)"
      >
        <span className="mr-1">🔍</span>
        <span className="hidden sm:inline">Search</span>
      </button>

      {isOpen && (
        <>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type to search apps..."
            className="absolute left-0 top-8 w-64 rounded-lg border px-3 py-2 text-sm outline-none z-10"
            style={{
              backgroundColor: 'var(--os-menu-bg)',
              borderColor: 'var(--os-border)',
              color: 'var(--os-text-primary)',
              boxShadow: 'var(--os-shadow-xl)',
            }}
            autoFocus
          />
          {query && filtered.length > 0 && (
            <div
              className="absolute left-0 top-[calc(2rem+2px)] w-64 rounded-lg border overflow-hidden z-10"
              style={{
                backgroundColor: 'var(--os-menu-bg)',
                borderColor: 'var(--os-border)',
                boxShadow: 'var(--os-shadow-xl)',
              }}
            >
              {filtered.map((app, i) => (
                <button
                  key={app.id}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors"
                  style={{
                    color: 'var(--os-text-primary)',
                    backgroundColor:
                      i === selectedIndex ? 'var(--os-menu-hover)' : 'transparent',
                  }}
                  onClick={() => handleSelect(app.id, app.name)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <span className="text-lg">{app.icon}</span>
                  <span>{app.name}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
