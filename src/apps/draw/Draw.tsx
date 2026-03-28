import { useRef, useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { writeFile, readFile } from '@/vfs/vfs';

type DrawTool = 'select' | 'rect' | 'circle' | 'line' | 'triangle' | 'text' | 'freehand' | 'eraser';

interface DrawProps {
  filePath?: string;
}

export function Draw({ filePath }: DrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<DrawTool>('select');
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [currentPath, setCurrentPath] = useState(filePath ?? '');
  const [saved, setSaved] = useState(true);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      selection: true,
    });

    fabricRef.current = canvas;

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Load file
  useEffect(() => {
    if (filePath && fabricRef.current) {
      readFile(filePath).then((file) => {
        if (file && typeof file.content === 'string' && file.content) {
          try {
            fabricRef.current?.loadFromJSON(file.content).then(() => {
              fabricRef.current?.renderAll();
            });
          } catch {
            // Invalid JSON, ignore
          }
        }
      });
      setCurrentPath(filePath);
      setSaved(true);
    }
  }, [filePath]);

  // Listen for file open events from File Manager
  useEffect(() => {
    const handler = (e: Event) => {
      const path = (e as CustomEvent<string>).detail;
      if (typeof path === 'string' && fabricRef.current) {
        setCurrentPath(path);
        setSaved(true);
        readFile(path).then((file) => {
          if (file && typeof file.content === 'string' && file.content) {
            try {
              fabricRef.current?.loadFromJSON(file.content).then(() => {
                fabricRef.current?.renderAll();
              });
            } catch {
              // Invalid JSON, ignore
            }
          }
        });
      }
    };
    window.addEventListener('webos:open-file', handler);
    return () => window.removeEventListener('webos:open-file', handler);
  }, []);

  // Tool handlers
  const handleToolChange = useCallback((tool: DrawTool) => {
    setActiveTool(tool);
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = tool === 'freehand';
    canvas.selection = tool === 'select';

    if (tool === 'freehand') {
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = strokeWidth;
        canvas.freeDrawingBrush.color = strokeColor;
      }
    }

    // Deselect all when switching tools
    canvas.discardActiveObject();
    canvas.renderAll();
  }, [strokeColor, strokeWidth]);

  // Mouse down for shape creation
  const handleMouseDown = useCallback((opt: fabric.TPointerEventInfo) => {
    const canvas = fabricRef.current;
    if (!canvas || activeTool === 'select' || activeTool === 'freehand' || activeTool === 'eraser') return;

    const pointer = canvas.getScenePoint(opt.e);

    switch (activeTool) {
      case 'rect':
        (canvas as any).__drawOrigin = { x: pointer.x, y: pointer.y };
        (canvas as any).__drawShape = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
        });
        canvas.add((canvas as any).__drawShape);
        break;

      case 'circle':
        (canvas as any).__drawOrigin = { x: pointer.x, y: pointer.y };
        (canvas as any).__drawShape = new fabric.Ellipse({
          left: pointer.x,
          top: pointer.y,
          rx: 0,
          ry: 0,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
        });
        canvas.add((canvas as any).__drawShape);
        break;

      case 'triangle':
        (canvas as any).__drawOrigin = { x: pointer.x, y: pointer.y };
        (canvas as any).__drawShape = new fabric.Triangle({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
        });
        canvas.add((canvas as any).__drawShape);
        break;

      case 'line':
        (canvas as any).__drawOrigin = { x: pointer.x, y: pointer.y };
        (canvas as any).__drawShape = new fabric.Line(
          [pointer.x, pointer.y, pointer.x, pointer.y],
          {
            stroke: strokeColor,
            strokeWidth,
          },
        );
        canvas.add((canvas as any).__drawShape);
        break;

      case 'text': {
        const text = new fabric.IText('Text', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 20,
          fill: strokeColor,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        break;
      }
    }
  }, [activeTool, fillColor, strokeColor, strokeWidth]);

  // Mouse move for shape resizing
  const handleMouseMove = useCallback((opt: fabric.TPointerEventInfo) => {
    const canvas = fabricRef.current;
    if (!canvas || activeTool === 'select' || activeTool === 'freehand' || activeTool === 'text') return;

    const shape = (canvas as any).__drawShape;
    const origin = (canvas as any).__drawOrigin;
    if (!shape || !origin) return;

    const pointer = canvas.getScenePoint(opt.e);
    const opt_e = opt.e.shiftKey;

    switch (activeTool) {
      case 'rect':
      case 'triangle': {
        const left = Math.min(origin.x, pointer.x);
        const top = Math.min(origin.y, pointer.y);
        const width = Math.abs(pointer.x - origin.x);
        const height = opt_e ? width : Math.abs(pointer.y - origin.y);
        shape.set({ left, top, width, height });
        break;
      }
      case 'circle': {
        const rx = Math.abs(pointer.x - origin.x) / 2;
        const ry = opt_e ? rx : Math.abs(pointer.y - origin.y) / 2;
        shape.set({
          left: Math.min(origin.x, pointer.x),
          top: Math.min(origin.y, pointer.y),
          rx,
          ry,
        });
        break;
      }
      case 'line':
        shape.set({ x2: pointer.x, y2: pointer.y });
        break;
    }

    canvas.renderAll();
  }, [activeTool]);

  // Mouse up
  const handleMouseUp = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    (canvas as any).__drawOrigin = null;
    (canvas as any).__drawShape = null;
    setSaved(false);
  }, []);

  // Attach events
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // Eraser: delete on click
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (activeTool === 'eraser') {
      const handler = (opt: fabric.TPointerEventInfo) => {
        const target = opt.target;
        if (target && target !== canvas.getActiveObject()) {
          canvas.remove(target);
          canvas.renderAll();
          setSaved(false);
        }
      };
      canvas.on('mouse:down', handler);
      return () => canvas.off('mouse:down', handler);
    }
  }, [activeTool]);

  // Auto-save
  useEffect(() => {
    if (!fabricRef.current || !currentPath) return;
    const timer = setInterval(() => {
      if (!saved && currentPath) saveDrawing();
    }, 5000);
    return () => clearInterval(timer);
  }, [fabricRef.current, currentPath, saved]);

  const saveDrawing = useCallback(async () => {
    if (!fabricRef.current || !currentPath) return;
    const json = JSON.stringify(fabricRef.current.toJSON());
    await writeFile(currentPath, json, 'application/json');
    setSaved(true);
  }, [currentPath]);

  const handleSave = () => {
    if (currentPath) {
      saveDrawing();
    } else {
      const name = prompt('Save as:', 'Drawing.json');
      if (name) {
        const path = `/home/Pictures/${name}`;
        setCurrentPath(path);
        const json = JSON.stringify(fabricRef.current?.toJSON() ?? {});
        writeFile(path, json, 'application/json');
        setSaved(true);
      }
    }
  };

  const handleExportPNG = () => {
    if (!fabricRef.current) return;
    const dataURL = fabricRef.current.toDataURL({ format: 'png', multiplier: 1 });
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'drawing.png';
    a.click();
  };

  const handleExportSVG = () => {
    if (!fabricRef.current) return;
    const svg = fabricRef.current.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drawing.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.renderAll();
      setSaved(false);
    }
  };

  const handleClear = () => {
    if (!confirm('Clear canvas?')) return;
    fabricRef.current?.clear();
    if (fabricRef.current) fabricRef.current.backgroundColor = '#ffffff';
    fabricRef.current?.renderAll();
    setSaved(false);
  };

  const tools: { id: DrawTool; label: string; icon: string }[] = [
    { id: 'select', label: 'Select', icon: '↖' },
    { id: 'freehand', label: 'Draw', icon: '✏️' },
    { id: 'rect', label: 'Rectangle', icon: '▭' },
    { id: 'circle', label: 'Circle', icon: '◯' },
    { id: 'triangle', label: 'Triangle', icon: '△' },
    { id: 'line', label: 'Line', icon: '╱' },
    { id: 'text', label: 'Text', icon: 'T' },
    { id: 'eraser', label: 'Eraser', icon: '⌫' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--os-bg-primary)]">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-[var(--os-border)] bg-[var(--os-bg-secondary)] flex-wrap">
        {/* Tools */}
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`h-7 w-7 flex items-center justify-center rounded text-xs transition-colors ${
              activeTool === tool.id
                ? 'bg-[var(--os-accent)]/20 text-[var(--os-accent)] ring-1 ring-[var(--os-accent)]'
                : 'text-[var(--os-text-secondary)] hover:bg-[var(--os-bg-hover)]'
            }`}
            onClick={() => handleToolChange(tool.id)}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}

        <div className="w-px h-5 bg-[var(--os-border)] mx-1" />

        {/* Colors */}
        <label className="flex items-center gap-1 text-[10px] text-[var(--os-text-muted)]">
          Fill
          <input
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer"
          />
        </label>
        <label className="flex items-center gap-1 text-[10px] text-[var(--os-text-muted)]">
          Stroke
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer"
          />
        </label>
        <label className="flex items-center gap-1 text-[10px] text-[var(--os-text-muted)]">
          Width
          <input
            type="range"
            min={1}
            max={20}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            className="w-16"
          />
          <span className="w-4">{strokeWidth}</span>
        </label>

        <div className="w-px h-5 bg-[var(--os-border)] mx-1" />

        <button
          className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]"
          onClick={handleDelete}
        >
          Delete
        </button>
        <button
          className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]"
          onClick={handleClear}
        >
          Clear
        </button>

        <div className="flex-1" />

        <button
          className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]"
          onClick={handleExportPNG}
        >
          PNG
        </button>
        <button
          className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]"
          onClick={handleExportSVG}
        >
          SVG
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-[var(--os-bg-tertiary)] overflow-auto p-4">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
