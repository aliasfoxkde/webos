import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfViewerProps {
  filePath?: string;
  fileData?: ArrayBuffer;
}

export function PdfViewer({ filePath, fileData }: PdfViewerProps) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load PDF
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        let data: ArrayBuffer;

        if (fileData) {
          data = fileData;
        } else if (filePath) {
          // For VFS files, read and convert
          const response = await fetch(filePath);
          if (!response.ok) throw new Error(`Failed to load: ${filePath}`);
          data = await response.arrayBuffer();
        } else {
          throw new Error('No PDF source provided');
        }

        const pdfDoc = await pdfjsLib.getDocument({ data }).promise;
        if (cancelled) return;

        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [filePath, fileData]);

  // Render page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    let cancelled = false;

    async function renderPage() {
      const page = await pdf.getPage(currentPage);
      if (cancelled) return;

      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current!;
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;
    }

    renderPage();
    return () => { cancelled = true; };
  }, [pdf, currentPage, scale]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const zoomIn = () => setScale((s) => Math.min(3, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(0.25, s - 0.25));

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goToPage(currentPage - 1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      goToPage(currentPage + 1);
    }
  }, [currentPage, goToPage]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[var(--os-bg-primary)] text-[var(--os-text-secondary)]">
        <span className="text-4xl mb-2">📕</span>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--os-bg-primary)]">
        <p className="text-sm text-[var(--os-text-muted)]">Loading PDF...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--os-bg-primary)]" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--os-border)] bg-[var(--os-bg-secondary)]">
        <button
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)] disabled:opacity-30 text-xs"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          ←
        </button>

        <span className="text-xs text-[var(--os-text-secondary)]">
          {currentPage} / {totalPages}
        </span>

        <button
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)] disabled:opacity-30 text-xs"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          →
        </button>

        <div className="w-px h-5 bg-[var(--os-border)] mx-1" />

        <button
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)] text-xs"
          onClick={zoomOut}
        >
          −
        </button>
        <span className="text-xs text-[var(--os-text-secondary)] min-w-[40px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)] text-xs"
          onClick={zoomIn}
        >
          +
        </button>
      </div>

      {/* Page */}
      <div className="flex-1 overflow-auto flex justify-center bg-[var(--os-bg-tertiary)] p-4">
        <canvas ref={canvasRef} className="shadow-lg" />
      </div>
    </div>
  );
}
