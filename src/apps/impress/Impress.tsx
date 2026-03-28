import { useState, useRef, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';
import { jsPDF } from 'jspdf';
import { writeFile, readFile } from '@/vfs/vfs';

interface Slide {
  id: string;
  canvas: string; // JSON-serialized canvas
  background: string;
}

const SLIDE_WIDTH = 960;
const SLIDE_HEIGHT = 540;

const THEMES = [
  { name: 'Default', background: '#ffffff', text: '#000000' },
  { name: 'Dark', background: '#1e293b', text: '#f1f5f9' },
  { name: 'Blue', background: '#1e40af', text: '#ffffff' },
  { name: 'Green', background: '#166534', text: '#ffffff' },
  { name: 'Red', background: '#991b1b', text: '#ffffff' },
];

interface ImpressProps {
  filePath?: string;
  onTitleChange?: (title: string) => void;
}

export function Impress({ filePath, onTitleChange }: ImpressProps) {
  const [slides, setSlides] = useState<Slide[]>([
    { id: 'slide-1', canvas: '{}', background: '#ffffff' },
  ]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const [presentSlide, setPresentSlide] = useState(0);
  const [currentPath, setCurrentPath] = useState(filePath ?? '');
  const [saved, setSaved] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const presentCanvasRef = useRef<HTMLCanvasElement>(null);
  const presentFabricRef = useRef<fabric.Canvas | null>(null);

  // Load file if path provided
  useEffect(() => {
    if (filePath) {
      readFile(filePath).then((file) => {
        if (file && typeof file.content === 'string' && file.content) {
          try {
            const data = JSON.parse(file.content);
            if (Array.isArray(data)) {
              setSlides(data);
            }
          } catch {
            // Not valid JSON, ignore
          }
        }
      });
      setCurrentPath(filePath);
      setSaved(true);
    }
  }, [filePath]);

  // Listen for file open events
  useEffect(() => {
    const handler = (e: Event) => {
      const path = (e as CustomEvent<string>).detail;
      if (typeof path === 'string') {
        readFile(path).then((file) => {
          if (file && typeof file.content === 'string' && file.content) {
            try {
              const data = JSON.parse(file.content);
              if (Array.isArray(data)) {
                setSlides(data);
                setActiveSlide(0);
              }
            } catch {
              // Not valid JSON, ignore
            }
          }
        });
        setCurrentPath(path);
        setSaved(true);
      }
    };
    window.addEventListener('webos:open-file', handler);
    return () => window.removeEventListener('webos:open-file', handler);
  }, []);

  const saveFile = useCallback(async (data?: Slide[]) => {
    const toSave = data ?? slides;
    if (!currentPath) return;
    await writeFile(currentPath, JSON.stringify(toSave), 'application/json');
    setSaved(true);
  }, [currentPath, slides]);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!currentPath) return;
    const timer = setInterval(() => {
      if (!saved) {
        saveFile();
      }
    }, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, saved]);

  // Mark unsaved when slides change
  useEffect(() => {
    setSaved(false);
  }, [slides]);

  const handleNew = () => {
    setSlides([{ id: 'slide-1', canvas: '{}', background: '#ffffff' }]);
    setActiveSlide(0);
    setCurrentPath('');
    setSaved(true);
    onTitleChange?.('Impress');
  };

  const handleSave = () => {
    if (currentPath) {
      saveFile();
    } else {
      const name = prompt('Save as:', 'Untitled.impress');
      if (name) {
        const path = `/home/Documents/${name}`;
        setCurrentPath(path);
        writeFile(path, JSON.stringify(slides), 'application/json');
        setSaved(true);
        onTitleChange?.(name);
      }
    }
  };

  // Initialize editor canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      backgroundColor: slides[activeSlide]?.background ?? '#ffffff',
      selection: true,
    });
    fabricRef.current = canvas;

    // Load slide content
    const slide = slides[activeSlide];
    if (slide && slide.canvas !== '{}') {
      try {
        canvas.loadFromJSON(slide.canvas).then(() => canvas.renderAll());
      } catch {
        // ignore
      }
    }

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [activeSlide]);

  // Save current slide before switching
  const saveCurrentSlide = useCallback(() => {
    if (!fabricRef.current) return;
    const json = JSON.stringify(fabricRef.current.toJSON());
    setSlides((prev) => {
      const updated = [...prev];
      updated[activeSlide] = {
        ...updated[activeSlide],
        canvas: json,
        background: fabricRef.current?.backgroundColor as string ?? '#ffffff',
      };
      return updated;
    });
  }, [activeSlide]);

  // Auto-save on canvas change
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const handler = () => saveCurrentSlide();
    canvas.on('object:modified', handler);
    canvas.on('object:added', handler);
    canvas.on('object:removed', handler);
    return () => {
      canvas.off('object:modified', handler);
      canvas.off('object:added', handler);
      canvas.off('object:removed', handler);
    };
  }, [activeSlide, saveCurrentSlide]);

  // Presentation mode
  useEffect(() => {
    if (!presenting || !presentCanvasRef.current) return;

    const canvas = new fabric.Canvas(presentCanvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: slides[presentSlide]?.background ?? '#ffffff',
      selection: false,
    });
    presentFabricRef.current = canvas;

    const slide = slides[presentSlide];
    if (slide && slide.canvas !== '{}') {
      canvas.loadFromJSON(slide.canvas).then(() => canvas.renderAll());
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPresenting(false);
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        setPresentSlide((s) => Math.min(slides.length - 1, s + 1));
      } else if (e.key === 'ArrowLeft') {
        setPresentSlide((s) => Math.max(0, s - 1));
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      canvas.dispose();
      presentFabricRef.current = null;
      window.removeEventListener('keydown', handleKey);
    };
  }, [presenting, presentSlide, slides]);

  const addSlide = () => {
    saveCurrentSlide();
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      canvas: '{}',
      background: '#ffffff',
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlide(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== activeSlide));
    setActiveSlide((i) => Math.min(i, slides.length - 2));
  };

  const duplicateSlide = () => {
    saveCurrentSlide();
    const current = slides[activeSlide];
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      canvas: current.canvas,
      background: current.background,
    };
    setSlides((prev) => {
      const updated = [...prev];
      updated.splice(activeSlide + 1, 0, newSlide);
      return updated;
    });
    setActiveSlide(activeSlide + 1);
  };

  const applyTheme = (theme: typeof THEMES[number]) => {
    if (!fabricRef.current) return;
    fabricRef.current.backgroundColor = theme.background;
    fabricRef.current.renderAll();
    saveCurrentSlide();
  };

  const addText = () => {
    if (!fabricRef.current) return;
    const text = new fabric.IText('Click to edit', {
      left: SLIDE_WIDTH / 2 - 100,
      top: SLIDE_HEIGHT / 2 - 20,
      fontSize: 36,
      fill: '#000000',
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    text.enterEditing();
    fabricRef.current.renderAll();
  };

  const addShape = (type: 'rect' | 'circle') => {
    if (!fabricRef.current) return;
    let shape;
    if (type === 'rect') {
      shape = new fabric.Rect({
        left: SLIDE_WIDTH / 2 - 75,
        top: SLIDE_HEIGHT / 2 - 50,
        width: 150,
        height: 100,
        fill: '#3b82f6',
      });
    } else {
      shape = new fabric.Ellipse({
        left: SLIDE_WIDTH / 2 - 50,
        top: SLIDE_HEIGHT / 2 - 50,
        rx: 50,
        ry: 50,
        fill: '#22c55e',
      });
    }
    fabricRef.current.add(shape);
    fabricRef.current.setActiveObject(shape);
    fabricRef.current.renderAll();
  };

  const exportPDF = () => {
    saveCurrentSlide();
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [SLIDE_WIDTH, SLIDE_HEIGHT] });

    for (let i = 0; i < slides.length; i++) {
      if (i > 0) pdf.addPage([SLIDE_WIDTH, SLIDE_HEIGHT], 'landscape');

      // Create temporary canvas for rendering
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = SLIDE_WIDTH;
      tmpCanvas.height = SLIDE_HEIGHT;

      const slide = slides[i];
      if (slide && slide.canvas !== '{}') {
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = SLIDE_WIDTH;
        exportCanvas.height = SLIDE_HEIGHT;
        const fCanvas = new fabric.Canvas(exportCanvas, {
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          backgroundColor: slide.background,
          selection: false,
          renderOnAddRemove: false,
        });
        fCanvas.loadFromJSON(JSON.parse(slide.canvas)).then(() => {
          fCanvas.renderAll();
          const dataURL = fCanvas.toDataURL({ format: 'png', multiplier: 1 });
          pdf.addImage(dataURL, 'PNG', 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);
          if (i === slides.length - 1) {
            pdf.save('presentation.pdf');
          }
          fCanvas.dispose();
        });
      } else {
        // Blank slide
        const ctx = tmpCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = slide?.background ?? '#ffffff';
          ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);
        }
        const dataURL = tmpCanvas.toDataURL();
        pdf.addImage(dataURL, 'PNG', 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);
        if (i === slides.length - 1) pdf.save('presentation.pdf');
      }
    }
  };

  // Presentation mode overlay
  if (presenting) {
    return (
      <div className="fixed inset-0 bg-black z-[99999] flex items-center justify-center">
        <canvas ref={presentCanvasRef} />
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-white text-sm opacity-50">
          Slide {presentSlide + 1} of {slides.length} — ESC to exit, arrows to navigate
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[var(--os-bg-primary)]">
      {/* Slide Panel */}
      <div className="w-48 border-r border-[var(--os-border)] flex flex-col bg-[var(--os-bg-secondary)] shrink-0">
        <div className="flex items-center justify-between px-2 py-1 border-b border-[var(--os-border)]">
          <span className="text-[10px] font-semibold text-[var(--os-text-muted)]">SLIDES</span>
          <span className="text-[10px] text-[var(--os-text-muted)]">{slides.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-1 space-y-1">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              className={`w-full aspect-video rounded border-2 transition-colors ${
                i === activeSlide ? 'border-[var(--os-accent)]' : 'border-transparent hover:border-[var(--os-border)]'
              }`}
              style={{ backgroundColor: slide.background }}
              onClick={() => {
                saveCurrentSlide();
                setActiveSlide(i);
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-2 py-1 border-b border-[var(--os-border)] bg-[var(--os-bg-secondary)]">
          <button className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]" onClick={addSlide}>
            + Slide
          </button>
          <button className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]" onClick={duplicateSlide}>
            Duplicate
          </button>
          <button className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]" onClick={deleteSlide} disabled={slides.length <= 1}>
            Delete
          </button>

          <div className="w-px h-5 bg-[var(--os-border)] mx-1" />

          <button className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]" onClick={() => addText()}>
            + Text
          </button>
          <button className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]" onClick={() => addShape('rect')}>
            + Rect
          </button>
          <button className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]" onClick={() => addShape('circle')}>
            + Circle
          </button>

          <div className="w-px h-5 bg-[var(--os-border)] mx-1" />

          <select
            className="h-6 px-1 text-[11px] bg-[var(--os-bg-tertiary)] text-[var(--os-text-primary)] rounded border border-[var(--os-border)]"
            onChange={(e) => {
              const theme = THEMES.find((t) => t.name === e.target.value);
              if (theme) applyTheme(theme);
            }}
          >
            {THEMES.map((t) => (
              <option key={t.name} value={t.name}>{t.name}</option>
            ))}
          </select>

          <div className="flex-1" />

          {!saved && <span className="text-[10px] text-[var(--os-accent)]">Unsaved</span>}
          {currentPath && <span className="text-[10px] text-[var(--os-text-muted)] ml-1 truncate max-w-[120px]">{currentPath.split('/').pop()}</span>}
          <button className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]" onClick={handleNew}>
            New
          </button>
          <button className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]" onClick={handleSave}>
            Save
          </button>
          <button className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]" onClick={() => setPresenting(true)}>
            Present
          </button>
          <button className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]" onClick={exportPDF}>
            PDF
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-[var(--os-bg-tertiary)] overflow-auto p-4">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}
