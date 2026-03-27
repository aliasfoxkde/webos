import { useState } from 'react';
import { useTheme } from '@/themes/theme-context';

type SettingsTab = 'theme' | 'about';

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'theme', label: 'Theme' },
  { id: 'about', label: 'About' },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme');
  const { currentTheme, themes, setTheme } = useTheme();

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 border-b px-6 py-3"
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
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div>
              <h3
                className="mb-1 text-sm font-semibold"
                style={{ color: 'var(--os-text-primary)' }}
              >
                Appearance
              </h3>
              <p
                className="text-xs"
                style={{ color: 'var(--os-text-muted)' }}
              >
                Choose a theme for WebOS. Changes apply immediately.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {themes.map((theme) => {
                const isSelected = theme.id === currentTheme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme)}
                    className="flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors"
                    style={{
                      borderColor: isSelected
                        ? 'var(--os-accent)'
                        : 'var(--os-border)',
                      backgroundColor: isSelected
                        ? 'var(--os-accent-muted)'
                        : 'var(--os-bg-secondary)',
                      minWidth: '120px',
                    }}
                  >
                    {/* Theme preview swatch */}
                    <div
                      className="h-16 w-16 rounded-lg border"
                      style={{
                        borderColor: 'var(--os-border)',
                        backgroundColor:
                          theme.id === 'dark'
                            ? '#0f172a'
                            : theme.id === 'light'
                              ? '#f8fafc'
                              : '#000000',
                        boxShadow: 'var(--os-shadow-sm)',
                      }}
                    >
                      <div
                        className="h-4 rounded-t-lg"
                        style={{
                          backgroundColor:
                            theme.id === 'dark'
                              ? '#1e293b'
                              : theme.id === 'light'
                                ? '#ffffff'
                                : '#1a1a1a',
                        }}
                      />
                      <div className="flex gap-1 p-1">
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              theme.id === 'high-contrast'
                                ? '#ffdd00'
                                : 'var(--os-accent)',
                          }}
                        />
                        <div
                          className="h-1.5 w-3 rounded"
                          style={{
                            backgroundColor:
                              theme.id === 'dark'
                                ? '#334155'
                                : theme.id === 'light'
                                  ? '#e2e8f0'
                                  : '#333333',
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: isSelected
                          ? 'var(--os-text-primary)'
                          : 'var(--os-text-secondary)',
                      }}
                    >
                      {theme.name}
                    </span>
                    {isSelected && (
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--os-accent)' }}
                      >
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Logo / Title */}
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-bold"
                style={{
                  backgroundColor: 'var(--os-accent)',
                  color: 'white',
                }}
              >
                W
              </div>
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: 'var(--os-text-primary)' }}
                >
                  WebOS
                </h2>
                <p
                  className="text-xs"
                  style={{ color: 'var(--os-text-muted)' }}
                >
                  A web-based operating system
                </p>
              </div>
            </div>

            {/* Version info table */}
            <div
              className="rounded-lg border"
              style={{
                borderColor: 'var(--os-border)',
                backgroundColor: 'var(--os-bg-secondary)',
              }}
            >
              <div className="divide-y" style={{ borderColor: 'var(--os-border)' }}>
                {[
                  ['Version', '0.1.0'],
                  ['Build', '2026.03.27'],
                  ['Kernel', 'WebOS Kernel v1.0'],
                  ['UI Framework', 'React 19'],
                  ['Window Manager', 'WebOS WM v1.0'],
                  ['Virtual File System', 'IndexedDB-backed VFS'],
                  ['Theme Engine', 'CSS Variables + Data Attributes'],
                  ['Rendering', 'Client-side SPA (Vite)'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderColor: 'var(--os-border)' }}
                  >
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--os-text-secondary)' }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--os-text-primary)' }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Credits */}
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--os-text-muted)' }}
            >
              WebOS is a browser-based operating system simulation featuring a
              virtual file system, window manager, process management, and
              multiple built-in applications. Built with React, TypeScript, and
              Tailwind CSS.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
