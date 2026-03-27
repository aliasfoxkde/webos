import { HyperFormula } from 'hyperformula';

export type Alignment = 'left' | 'center' | 'right';

export interface CellData {
  value: string;
  bold: boolean;
  italic: boolean;
  alignment: Alignment;
}

export type SheetData = Record<string, CellData>;

export interface Workbook {
  name: string;
  sheets: Record<string, SheetData>;
  activeSheet: string;
}

export function createEmptySheetData(): SheetData {
  return {};
}

export function getCellData(sheet: SheetData, row: number, col: number): CellData {
  const key = cellKey(row, col);
  return sheet[key] ?? { value: '', bold: false, italic: false, alignment: 'right' };
}

export function setCellData(sheet: SheetData, row: number, col: number, data: Partial<CellData>): SheetData {
  const key = cellKey(row, col);
  const existing = sheet[key] ?? { value: '', bold: false, italic: false, alignment: 'right' };
  return { ...sheet, [key]: { ...existing, ...data } };
}

export function cellKey(row: number, col: number): string {
  return `${col},${row}`;
}

export function columnLabel(col: number): string {
  let label = '';
  let c = col;
  while (c >= 0) {
    label = String.fromCharCode(65 + (c % 26)) + label;
    c = Math.floor(c / 26) - 1;
  }
  return label;
}

export function parseColumnLabel(label: string): number {
  let col = 0;
  for (let i = 0; i < label.length; i++) {
    col = col * 26 + (label.charCodeAt(i) - 64);
  }
  return col - 1;
}

export function createEngine(sheetData: SheetData): HyperFormula {
  // Convert SheetData to HyperFormula format
  const hfData: Record<string, string[][]> = {};

  // Find bounds
  let maxRow = 0;
  let maxCol = 0;
  for (const key of Object.keys(sheetData)) {
    const [colStr, rowStr] = key.split(',');
    const col = parseInt(colStr);
    const row = parseInt(rowStr);
    if (row > maxRow) maxRow = row;
    if (col > maxCol) maxCol = col;
  }

  // Create 2D array
  const data: string[][] = Array.from({ length: maxRow + 1 }, () =>
    Array.from({ length: maxCol + 1 }, () => ''),
  );

  for (const [key, cell] of Object.entries(sheetData)) {
    const [colStr, rowStr] = key.split(',');
    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    data[row][col] = cell.value;
  }

  hfData['Sheet1'] = data;

  return HyperFormula.buildFromArray(data, {
    licenseKey: 'gpl-v3',
  });
}

export function getCalculatedValue(
  engine: HyperFormula,
  sheet: number,
  row: number,
  col: number,
): string | number | null {
  try {
    const value = engine.getCellValue({ sheet, row, col });
    if (value === null || value === undefined) return null;
    if (typeof value === 'boolean') return null;
    // DetailedCellError objects are not string/number, filter them out
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    return value;
  } catch {
    return null;
  }
}

export function formatCellValue(value: string | number | null): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function exportToCSV(sheetData: SheetData): string {
  let maxRow = 0;
  let maxCol = 0;
  for (const key of Object.keys(sheetData)) {
    const [colStr, rowStr] = key.split(',');
    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    if (row > maxRow) maxRow = row;
    if (col > maxCol) maxCol = col;
  }

  const rows: string[] = [];
  for (let r = 0; r <= maxRow; r++) {
    const cols: string[] = [];
    for (let c = 0; c <= maxCol; c++) {
      const cell = sheetData[cellKey(r, c)];
      const value = cell?.value ?? '';
      // Escape CSV values
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        cols.push(`"${value.replace(/"/g, '""')}"`);
      } else {
        cols.push(value);
      }
    }
    rows.push(cols.join(','));
  }
  return rows.join('\n');
}
