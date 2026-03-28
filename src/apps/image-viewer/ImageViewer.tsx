import { useState, useEffect, useRef } from 'react';
import { readFile } from '@/vfs/vfs';

interface ImageViewerProps {
  filePath?: string;
  url?: string;
}

export function ImageViewer({ filePath, url: urlProp }: ImageViewerProps) {
  const [activeFilePath, setActiveFilePath] = useState(filePath);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  // Listen for file open events from File Manager
  useEffect(() => {
    const handler = (e: Event) => {
      const path = (e as CustomEvent<string>).detail;
      if (typeof path === 'string') {
        setActiveFilePath(path);
      }
    };
    window.addEventListener('webos:open-file', handler);
    return () => window.removeEventListener('webos:open-file', handler);
  }, []);

  // Load image from VFS filePath or external URL
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        if (activeFilePath) {
          const node = await readFile(activeFilePath);
          if (!node) {
            if (!cancelled) setError(`File not found: ${activeFilePath}`);
            return;
          }
          if (node.content instanceof ArrayBuffer) {
            // Determine MIME type or fall back to octet-stream
            const mime = node.mimeType || 'application/octet-stream';
            const blob = new Blob([node.content], { type: mime });
            const objUrl = URL.createObjectURL(blob);
            objectUrlRef.current = objUrl;
            if (!cancelled) setImageUrl(objUrl);
          } else {
            if (!cancelled) setError('Not a binary image file');
          }
        } else if (urlProp) {
          if (!cancelled) setImageUrl(urlProp);
        } else {
          if (!cancelled) setError('No image source provided');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load image');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [activeFilePath, urlProp]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 5));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.1));
  const resetZoom = () => setZoom(1);

  return (
    <div
      className="relative flex h-full flex-col"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 border-b px-3 py-1.5"
        style={{
          backgroundColor: 'var(--os-bg-secondary)',
          borderColor: 'var(--os-border)',
        }}
      >
        <button
          onClick={zoomOut}
          className="rounded px-2 py-1 text-sm font-medium hover:bg-[var(--os-bg-hover)]"
          style={{ color: 'var(--os-text-primary)' }}
          title="Zoom out"
        >
          -
        </button>
        <span
          className="min-w-[4rem] text-center text-xs tabular-nums"
          style={{ color: 'var(--os-text-secondary)' }}
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="rounded px-2 py-1 text-sm font-medium hover:bg-[var(--os-bg-hover)]"
          style={{ color: 'var(--os-text-primary)' }}
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={resetZoom}
          className="rounded px-2 py-1 text-xs hover:bg-[var(--os-bg-hover)]"
          style={{ color: 'var(--os-text-secondary)' }}
        >
          Fit
        </button>
        <div className="flex-1" />
        {filePath && (
          <span
            className="truncate text-xs"
            style={{ color: 'var(--os-text-muted)' }}
            title={filePath}
          >
            {filePath.split('/').pop()}
          </span>
        )}
      </div>

      {/* Image area */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-2">
        {loading && (
          <div
            className="text-sm"
            style={{ color: 'var(--os-text-muted)' }}
          >
            Loading...
          </div>
        )}

        {error && (
          <div className="text-center">
            <div
              className="mb-2 text-4xl"
              style={{ color: 'var(--os-text-muted)' }}
            >
              !
            </div>
            <div
              className="text-sm"
              style={{ color: 'var(--os-error)' }}
            >
              {error}
            </div>
          </div>
        )}

        {imageUrl && !loading && !error && (
          <img
            src={imageUrl}
            alt={filePath || urlProp || 'Image'}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 150ms ease',
              imageRendering: zoom > 2 ? 'pixelated' : 'auto',
            }}
            draggable={false}
          />
        )}

        {!imageUrl && !loading && !error && (
          <div
            className="text-sm"
            style={{ color: 'var(--os-text-muted)' }}
          >
            No image to display
          </div>
        )}
      </div>
    </div>
  );
}
