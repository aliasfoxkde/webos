import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  type SheetData,
  getCellData,
  setCellData,
  columnLabel,
  createEngine,
  getCalculatedValue,
  formatCellValue,
  exportToCSV,
} from './engine';
import { writeFile, readFile } from '@/vfs/vfs';

const DEFAULT_ROWS = 100;
const DEFAULT_COLS = 26;
const CELL_WIDTH = 100;
const CELL_HEIGHT = 28;
const HEADER_WIDTH = 40;
const ROW_HEADER_WIDTH = 50;
const SCROLL_THRESHOLD = 20;

interface CalcProps {
  filePath?: string;
  onTitleChange?: (title: string) => void;
}

export function Calc({ filePath, onTitleChange }: CalcProps) {
  const [sheetData, setSheetData] = useState<SheetData>({});
  const [currentPath, setCurrentPath] = useState(filePath ?? '');
  const [saved, setSaved] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [scrollOffset, setScrollOffset] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Recalculate when sheet data changes
  const engine = useMemo(() => createEngine(sheetData), [sheetData]);

  const selectedData = getCellData(sheetData, selectedCell.row, selectedCell.col);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (editingCell) {
      // Commit edit
      const newData = setCellData(sheetData, editingCell.row, editingCell.col, { value: editValue });
      setSheetData(newData);
      setEditingCell(null);
    }
    setSelectedCell({ row, col });
  }, [editingCell, editValue, sheetData]);

  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
    setEditingCell({ row, col });
    setEditValue(getCellData(sheetData, row, col).value);
  }, [sheetData]);

  const handleFormulaBarChange = useCallback((value: string) => {
    setEditValue(value);
    const newData = setCellData(sheetData, selectedCell.row, selectedCell.col, { value });
    setSheetData(newData);
  }, [sheetData, selectedCell]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const newData = setCellData(sheetData, editingCell.row, editingCell.col, { value: editValue });
        setSheetData(newData);
        setEditingCell(null);
        setSelectedCell({ row: editingCell.row + 1, col: editingCell.col });
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const newData = setCellData(sheetData, editingCell.row, editingCell.col, { value: editValue });
        setSheetData(newData);
        setEditingCell(null);
        setSelectedCell({ row: editingCell.row, col: editingCell.col + 1 });
      } else if (e.key === 'Escape') {
        setEditingCell(null);
      }
      return;
    }

    const { row, col } = selectedCell;
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedCell({ row: Math.max(0, row - 1), col });
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedCell({ row: row + 1, col });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedCell({ row, col: Math.max(0, col - 1) });
        break;
      case 'ArrowRight':
        e.preventDefault();
        setSelectedCell({ row, col: col + 1 });
        break;
      case 'Enter':
        e.preventDefault();
        setSelectedCell({ row: row + 1, col });
        break;
      case 'Tab':
        e.preventDefault();
        setSelectedCell({ row, col: col + 1 });
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        {
          const newData = setCellData(sheetData, row, col, { value: '' });
          setSheetData(newData);
        }
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setEditingCell({ row, col });
          setEditValue(e.key);
        }
        break;
    }
  }, [editingCell, editValue, selectedCell, sheetData]);

  // Edit mode cell input handler
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  // Scroll virtualization
  const visibleRows = Math.ceil((containerRef.current?.clientHeight ?? 400) / CELL_HEIGHT);
  const visibleCols = Math.ceil((containerRef.current?.clientWidth ?? 600) / CELL_WIDTH);

  const startRow = Math.max(0, Math.floor(scrollOffset.top / CELL_HEIGHT) - SCROLL_THRESHOLD);
  const endRow = Math.min(DEFAULT_ROWS, startRow + visibleRows + SCROLL_THRESHOLD * 2);
  const startCol = Math.max(0, Math.floor(scrollOffset.left / CELL_WIDTH) - 2);
  const endCol = Math.min(DEFAULT_COLS, startCol + visibleCols + 4);

  // Load file if path provided
  useEffect(() => {
    if (filePath) {
      readFile(filePath).then((file) => {
        if (file && typeof file.content === 'string' && file.content) {
          try {
            setSheetData(JSON.parse(file.content));
          } catch {
            // Not valid JSON, ignore
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
      if (typeof path === 'string') {
        setCurrentPath(path);
        setSaved(true);
        readFile(path).then((file) => {
          if (file && typeof file.content === 'string' && file.content) {
            try {
              setSheetData(JSON.parse(file.content));
            } catch {
              // Not valid JSON, ignore
            }
          }
        });
      }
    };
    window.addEventListener('webos:open-file', handler);
    return () => window.removeEventListener('webos:open-file', handler);
  }, []);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!currentPath) return;
    const timer = setInterval(() => {
      if (!saved && currentPath) {
        saveFile();
      }
    }, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, saved]);

  const saveFile = useCallback(async () => {
    if (!currentPath) return;
    await writeFile(currentPath, JSON.stringify(sheetData), 'application/json');
    setSaved(true);
  }, [currentPath, sheetData]);

  const handleNew = () => {
    setSheetData({});
    setCurrentPath('');
    setSaved(true);
    onTitleChange?.('Calc');
  };

  const handleSave = () => {
    if (currentPath) {
      saveFile();
    } else {
      const name = prompt('Save as:', 'Untitled.json');
      if (name) {
        const path = `/home/Documents/${name}`;
        setCurrentPath(path);
        writeFile(path, JSON.stringify(sheetData), 'application/json');
        setSaved(true);
        onTitleChange?.(name);
      }
    }
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(sheetData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mark unsaved on data change
  useEffect(() => {
    setSaved(false);
  }, [sheetData]);

  return (
    <div className="flex flex-col h-full bg-[var(--os-bg-primary)]" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-[var(--os-border)] bg-[var(--os-bg-secondary)]">
        <button
          className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]"
          onClick={handleNew}
        >
          New
        </button>
        <button
          className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="h-6 px-2 text-[11px] rounded hover:bg-[var(--os-bg-hover)] text-[var(--os-text-secondary)]"
          onClick={handleExportCSV}
        >
          Export CSV
        </button>
        {!saved && <span className="text-[10px] text-[var(--os-accent)] ml-1">Unsaved</span>}
        {currentPath && <span className="text-[10px] text-[var(--os-text-muted)] ml-1 truncate max-w-[200px]">{currentPath.split('/').pop()}</span>}
      </div>

      {/* Formula Bar */}
      <div className="flex items-center gap-2 px-2 py-1 border-b border-[var(--os-border)] bg-[var(--os-bg-secondary)]">
        <span className="w-12 text-[11px] text-[var(--os-text-muted)] font-mono">
          {columnLabel(selectedCell.col)}{selectedCell.row + 1}
        </span>
        <span className="text-[var(--os-text-muted)]">=</span>
        <input
          type="text"
          className="flex-1 h-6 px-2 text-[11px] bg-[var(--os-bg-primary)] text-[var(--os-text-primary)] border border-[var(--os-border)] rounded outline-none focus:border-[var(--os-accent)]"
          value={editingCell ? editValue : selectedData.value}
          onChange={(e) => handleFormulaBarChange(e.target.value)}
          onFocus={() => {
            if (!editingCell) {
              setEditingCell(selectedCell);
              setEditValue(selectedData.value);
            }
          }}
        />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto relative" ref={containerRef} onScroll={(e) => {
        setScrollOffset({
          top: e.currentTarget.scrollTop,
          left: e.currentTarget.scrollLeft,
        });
      }}>
        <div
          style={{
            width: ROW_HEADER_WIDTH + endCol * CELL_WIDTH,
            height: HEADER_WIDTH + endRow * CELL_HEIGHT,
          }}
        >
          {/* Column Headers */}
          <div className="sticky top-0 z-10 flex" style={{ height: HEADER_WIDTH, marginLeft: ROW_HEADER_WIDTH }}>
            {Array.from({ length: endCol }, (_, i) => i).map((col) => (
              <div
                key={col}
                className={`shrink-0 flex items-center justify-center text-[10px] border-b border-r border-[var(--os-border)] bg-[var(--os-bg-secondary)] text-[var(--os-text-muted)] select-none ${
                  col === selectedCell.col ? 'bg-[var(--os-accent)]/10' : ''
                }`}
                style={{ width: CELL_WIDTH }}
              >
                {columnLabel(col)}
              </div>
            ))}
          </div>

          {/* Row Headers + Cells */}
          {Array.from({ length: endRow }, (_, i) => i).map((row) => (
            <div key={row} className="flex" style={{ height: CELL_HEIGHT }}>
              {/* Row Header */}
              <div
                className={`sticky left-0 z-10 shrink-0 flex items-center justify-center text-[10px] border-b border-r border-[var(--os-border)] bg-[var(--os-bg-secondary)] text-[var(--os-text-muted)] select-none ${
                  row === selectedCell.row ? 'bg-[var(--os-accent)]/10' : ''
                }`}
                style={{ width: ROW_HEADER_WIDTH }}
              >
                {row + 1}
              </div>

              {/* Cells */}
              {Array.from({ length: endCol }, (_, i) => i).map((col) => {
                const cell = getCellData(sheetData, row, col);
                const isSelected = row === selectedCell.row && col === selectedCell.col;
                const isEditing = editingCell?.row === row && editingCell?.col === col;
                const calculatedValue = formatCellValue(getCalculatedValue(engine, 0, row, col) ?? cell.value);

                return (
                  <div
                    key={col}
                    className={`shrink-0 border-b border-r border-[var(--os-border)] text-[11px] cursor-cell overflow-hidden whitespace-nowrap ${
                      isSelected ? 'outline outline-2 outline-[var(--os-accent)] outline-offset-[-1px]' : ''
                    } ${cell.bold ? 'font-bold' : ''} ${cell.italic ? 'italic' : ''}`}
                    style={{
                      width: CELL_WIDTH,
                      height: CELL_HEIGHT,
                      textAlign: cell.alignment,
                      padding: '0 6px',
                      lineHeight: `${CELL_HEIGHT}px`,
                    }}
                    onClick={() => handleCellClick(row, col)}
                    onDoubleClick={() => handleCellDoubleClick(row, col)}
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        className="w-full h-full bg-[var(--os-accent)]/10 outline-none text-[11px] px-1"
                        value={editValue}
                        onChange={(e) => {
                          setEditValue(e.target.value);
                          const newData = setCellData(sheetData, row, col, { value: e.target.value });
                          setSheetData(newData);
                        }}
                        onBlur={() => {
                          setEditingCell(null);
                        }}
                      />
                    ) : (
                      <span className="text-[var(--os-text-primary)]">{calculatedValue}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
