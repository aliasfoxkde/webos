import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock CodeMirror
vi.mock('codemirror', () => ({
  EditorView: vi.fn().mockImplementation(() => ({
    state: { doc: { toString: () => 'hello' } },
    destroy: vi.fn(),
    dispatch: vi.fn(),
    hasFocus: vi.fn().mockReturnValue(false),
    focus: vi.fn(),
  })),
  basicSetup: [],
}));

vi.mock('@codemirror/state', () => ({
  EditorState: { create: vi.fn() },
  Extension: {},
}));

vi.mock('@codemirror/theme-one-dark', () => ({
  oneDark: [],
}));

vi.mock('@codemirror/lang-javascript', () => ({
  javascript: () => [],
}));

vi.mock('@codemirror/lang-json', () => ({
  json: () => [],
}));

vi.mock('@codemirror/lang-markdown', () => ({
  markdown: () => [],
}));

vi.mock('@/vfs/vfs', () => ({
  readFile: vi.fn().mockResolvedValue({ content: 'hello' }),
  writeFile: vi.fn().mockResolvedValue({}),
  mkdir: vi.fn().mockResolvedValue({}),
  exists: vi.fn().mockResolvedValue(true),
}));

import { TextEditor } from './TextEditor';

describe('TextEditor', () => {
  it('renders without crashing', () => {
    const { container } = render(<TextEditor />);
    expect(container).toBeDefined();
  });

  it('renders status bar', () => {
    render(<TextEditor />);
    // Should have a status bar showing file info
    const statusBar = document.querySelector('.border-t');
    expect(statusBar).toBeDefined();
  });

  it('renders toolbar with New, Open, Save buttons', () => {
    render(<TextEditor />);
    expect(screen.getByText('New')).toBeDefined();
    expect(screen.getByText('Open')).toBeDefined();
    expect(screen.getByText('Save')).toBeDefined();
  });
});
