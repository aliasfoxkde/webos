import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/themes/theme-context';
import { useAuthStore } from '@/stores/auth-store';
import { getSyncStatus, fullSync, processSyncQueue, clearSyncState } from '@/vfs/sync-r2';

type SettingsTab = 'theme' | 'sync' | 'about';

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'theme', label: 'Theme' },
  { id: 'sync', label: 'Cloud Sync' },
  { id: 'about', label: 'About' },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme');
  const { currentTheme, themes, setTheme } = useTheme();
  const { isAuthenticated, userId, username, token, login, logout, isLoading } = useAuthStore();
  const [syncStatus, setSyncStatus] = useState({ lastSyncAt: 0, queueLength: 0 });
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setSyncStatus(getSyncStatus());
      const interval = setInterval(() => setSyncStatus(getSyncStatus()), 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = useCallback(async () => {
    setLoginError(null);
    const ok = await login(loginForm.username, loginForm.password);
    if (!ok) setLoginError('Login failed');
  }, [login, loginForm]);

  const handleSync = useCallback(async () => {
    if (!token || !userId) return;
    setSyncResult('Syncing...');
    try {
      await processSyncQueue(token);
      const result = await fullSync(token, userId);
      setSyncResult(`Sync complete: ${result.uploaded} uploaded, ${result.downloaded} downloaded`);
      setSyncStatus(getSyncStatus());
    } catch {
      setSyncResult('Sync failed');
    }
  }, [token, userId]);

  const handleLogout = useCallback(() => {
    clearSyncState();
    logout();
  }, [logout]);

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

        {activeTab === 'sync' && (
          <div className="space-y-6">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--os-text-primary)' }}>
                    Sign In
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--os-text-muted)' }}>
                    Sign in to sync your files across devices using Cloudflare R2.
                  </p>
                </div>

                {loginError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-400">
                    {loginError}
                  </div>
                )}

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{
                      borderColor: 'var(--os-border)',
                      backgroundColor: 'var(--os-bg-tertiary)',
                      color: 'var(--os-text-primary)',
                    }}
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{
                      borderColor: 'var(--os-border)',
                      backgroundColor: 'var(--os-bg-tertiary)',
                      color: 'var(--os-text-primary)',
                    }}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                  <button
                    className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: 'var(--os-accent)' }}
                    onClick={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--os-text-primary)' }}>
                      Cloud Sync
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--os-text-muted)' }}>
                      Signed in as {username}
                    </p>
                  </div>
                  <button
                    className="rounded-lg border px-3 py-1.5 text-xs"
                    style={{
                      borderColor: 'var(--os-border)',
                      color: 'var(--os-text-secondary)',
                    }}
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>

                <div
                  className="rounded-lg border"
                  style={{
                    borderColor: 'var(--os-border)',
                    backgroundColor: 'var(--os-bg-secondary)',
                  }}
                >
                  <div className="divide-y" style={{ borderColor: 'var(--os-border)' }}>
                    <div className="flex items-center justify-between px-4 py-2.5" style={{ borderColor: 'var(--os-border)' }}>
                      <span className="text-xs font-medium" style={{ color: 'var(--os-text-secondary)' }}>Status</span>
                      <span className="text-xs" style={{ color: syncStatus.queueLength > 0 ? '#f59e0b' : '#22c55e' }}>
                        {syncStatus.queueLength > 0 ? `${syncStatus.queueLength} files pending` : 'All synced'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5" style={{ borderColor: 'var(--os-border)' }}>
                      <span className="text-xs font-medium" style={{ color: 'var(--os-text-secondary)' }}>Last Sync</span>
                      <span className="text-xs" style={{ color: 'var(--os-text-primary)' }}>
                        {syncStatus.lastSyncAt ? new Date(syncStatus.lastSyncAt).toLocaleString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--os-accent)' }}
                  onClick={handleSync}
                >
                  Sync Now
                </button>

                {syncResult && (
                  <div className="rounded-lg border px-4 py-2 text-xs" style={{
                    borderColor: 'var(--os-border)',
                    color: 'var(--os-text-secondary)',
                  }}>
                    {syncResult}
                  </div>
                )}
              </div>
            )}
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
                  ['Cloud Storage', 'Cloudflare R2 + KV'],
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
