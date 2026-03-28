import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock CodeMirror
vi.mock('codemirror', () => ({
  EditorView: vi.fn().mockImplementation(() => ({})),
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
});
