import { useState, useCallback, useRef } from 'react';
import { useBrowserHistory } from './use-browser-history';
import { useBrowserBookmarks } from './use-browser-bookmarks';
import { writeFile, mkdir } from '@/vfs/vfs';

export function Browser() {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const {
    current,
    history,
    navigate,
    back,
    forward,
    canGoBack,
    canGoForward,
    clearHistory,
  } = useBrowserHistory('about:blank');
  const { bookmarks, isBookmarked, toggleBookmark } = useBrowserBookmarks();
  const [downloadUrl, setDownloadUrl] = useState('');
  const [showDownload, setShowDownload] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');

  const handleDownload = useCallback(async () => {
    let url = downloadUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    setDownloadStatus('Downloading...');
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const blob = await response.blob();
      const text = await blob.text();

      // Extract filename from URL
      const urlPath = new URL(url).pathname;
      const filename = urlPath.split('/').pop() || 'download';
      const savePath = `/home/Downloads/${filename}`;

      await mkdir('/home/Downloads').catch(() => {});
      await writeFile(savePath, text, contentType);
      setDownloadStatus(`Saved to ${savePath}`);
      setDownloadUrl('');
      setTimeout(() => { setShowDownload(false); setDownloadStatus(''); }, 2000);
    } catch (err) {
      setDownloadStatus(`Error: ${err instanceof Error ? err.message : 'Download failed'}`);
    }
  }, [downloadUrl]);

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

        <button
          className={navBtnClass(false)}
          onClick={() => toggleBookmark(current.url, current.title || current.url)}
          title={isBookmarked(current.url) ? 'Remove bookmark' : 'Bookmark this page'}
          style={{ color: isBookmarked(current.url) ? 'var(--os-accent)' : 'var(--os-text-secondary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill={isBookmarked(current.url) ? 'currentColor' : 'none'}>
            <path d="M8 1L10.1 5.4L15 6.1L11.5 9.5L12.3 14.4L8 12.1L3.7 14.4L4.5 9.5L1 6.1L5.9 5.4L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          className={navBtnClass(false)}
          onClick={() => setShowDownload(!showDownload)}
          title="Download file to VFS"
          style={{ color: 'var(--os-text-secondary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 11V13H14V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

      {/* Download panel */}
      {showDownload && (
        <div
          className="flex items-center gap-2 border-b px-3 py-2"
          style={{
            backgroundColor: 'var(--os-bg-secondary)',
            borderColor: 'var(--os-border)',
          }}
        >
          <span className="text-xs shrink-0" style={{ color: 'var(--os-text-muted)' }}>Save URL:</span>
          <input
            type="text"
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleDownload(); }}
            placeholder="https://example.com/file.txt"
            className="flex-1 rounded border px-2 py-1 text-xs outline-none"
            style={{
              borderColor: 'var(--os-border)',
              backgroundColor: 'var(--os-bg-tertiary)',
              color: 'var(--os-text-primary)',
            }}
          />
          <button
            onClick={handleDownload}
            disabled={!downloadUrl.trim()}
            className="px-2 py-1 text-xs rounded cursor-pointer"
            style={{
              backgroundColor: 'var(--os-accent)',
              color: 'white',
              opacity: downloadUrl.trim() ? 1 : 0.5,
            }}
          >
            Save
          </button>
          {downloadStatus && (
            <span className="text-xs shrink-0" style={{ color: downloadStatus.startsWith('Error') ? 'var(--os-error)' : 'var(--os-accent)' }}>
              {downloadStatus}
            </span>
          )}
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
            {history.length > 1 && (
              <button
                onClick={clearHistory}
                className="text-xs px-3 py-1 rounded-md border transition-colors"
                style={{
                  borderColor: 'var(--os-border)',
                  color: 'var(--os-text-secondary)',
                }}
              >
                Clear History
              </button>
            )}
            {bookmarks.length > 0 && (
              <div className="flex flex-col gap-1 w-full max-w-md px-4">
                <span className="text-xs font-medium" style={{ color: 'var(--os-text-muted)' }}>
                  Bookmarks
                </span>
                {bookmarks.map((bm) => (
                  <button
                    key={bm.url}
                    onClick={() => {
                      setUrlInput(bm.url);
                      setIsLoading(true);
                      navigate(bm.url, bm.title);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors hover:bg-[var(--os-bg-hover)]"
                    style={{
                      backgroundColor: 'var(--os-bg-secondary)',
                      color: 'var(--os-text-primary)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--os-accent)">
                      <path d="M6 0.5L7.6 4.1L11.5 4.6L8.7 7.1L9.5 11L6 9.1L2.5 11L3.3 7.1L0.5 4.6L4.4 4.1L6 0.5Z"/>
                    </svg>
                    <span className="truncate">{bm.title}</span>
                  </button>
                ))}
              </div>
            )}
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
