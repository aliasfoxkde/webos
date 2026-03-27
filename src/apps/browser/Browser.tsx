import { useState, useCallback, useRef } from 'react';
import { useBrowserHistory } from './use-browser-history';

export function Browser() {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const {
    current,
    navigate,
    back,
    forward,
    canGoBack,
    canGoForward,
  } = useBrowserHistory('about:blank');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      let url = urlInput.trim();
      if (!url) return;

      // Auto-add https:// if no protocol
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('about:')) {
        // Treat as search or URL
        if (url.includes('.') && !url.includes(' ')) {
          url = 'https://' + url;
        } else {
          url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        }
      }

      setUrlInput(url);
      setIsLoading(true);
      navigate(url, url);
    },
    [urlInput, navigate],
  );

  const goHome = useCallback(() => {
    const homeUrl = 'about:blank';
    setUrlInput('');
    navigate(homeUrl, 'New Tab');
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    if (iframeRef.current && current.url !== 'about:blank') {
      setIsLoading(true);
      // Force iframe reload by re-setting src
      const src = iframeRef.current.src;
      iframeRef.current.src = '';
      iframeRef.current.src = src;
    }
  }, [current.url]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const navBtnClass = (disabled: boolean) =>
    `flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
      disabled
        ? 'opacity-40 cursor-default'
        : 'cursor-pointer hover:bg-[var(--os-bg-hover)]'
    }`;

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
    >
      {/* Navigation bar */}
      <div
        className="flex items-center gap-2 border-b px-3 py-2"
        style={{
          backgroundColor: 'var(--os-bg-secondary)',
          borderColor: 'var(--os-border)',
        }}
      >
        <button
          className={navBtnClass(!canGoBack)}
          disabled={!canGoBack}
          onClick={back}
          title="Back"
          style={{ color: 'var(--os-text-secondary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          className={navBtnClass(!canGoForward)}
          disabled={!canGoForward}
          onClick={forward}
          title="Forward"
          style={{ color: 'var(--os-text-secondary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          className={navBtnClass(false)}
          onClick={handleRefresh}
          title="Refresh"
          style={{ color: 'var(--os-text-secondary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 2.5L11 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          className={navBtnClass(false)}
          onClick={goHome}
          title="Home"
          style={{ color: 'var(--os-text-secondary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8L8 2L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 7V13.5H6.5V9.5H9.5V13.5H13V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <form onSubmit={handleSubmit} className="flex-1">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Search or enter URL..."
            className="w-full rounded-lg border px-3 py-1.5 text-sm outline-none"
            style={{
              borderColor: 'var(--os-border)',
              backgroundColor: 'var(--os-bg-tertiary)',
              color: 'var(--os-text-primary)',
            }}
          />
        </form>
      </div>

      {/* Loading bar */}
      {isLoading && (
        <div className="h-0.5 w-full overflow-hidden" style={{ backgroundColor: 'var(--os-bg-secondary)' }}>
          <div
            className="h-full animate-pulse"
            style={{
              backgroundColor: 'var(--os-accent)',
              width: '60%',
            }}
          />
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 relative">
        {current.url === 'about:blank' ? (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div
              className="text-5xl font-bold"
              style={{ color: 'var(--os-text-muted)' }}
            >
              WebOS Browser
            </div>
            <p
              className="text-sm"
              style={{ color: 'var(--os-text-secondary)' }}
            >
              Enter a URL or search term above to get started
            </p>
            <form onSubmit={handleSubmit} className="w-full max-w-md px-4">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Search the web..."
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={{
                  borderColor: 'var(--os-border)',
                  backgroundColor: 'var(--os-bg-secondary)',
                  color: 'var(--os-text-primary)',
                }}
              />
            </form>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={current.url}
            className="absolute inset-0 h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
            onLoad={handleIframeLoad}
            title="Browser content"
          />
        )}
      </div>
    </div>
  );
}
