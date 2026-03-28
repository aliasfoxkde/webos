import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/vfs/vfs', () => ({
  readdir: vi.fn().mockResolvedValue([]),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue(null),
  mkdir: vi.fn().mockResolvedValue(undefined),
  rm: vi.fn().mockResolvedValue(undefined),
  cp: vi.fn().mockResolvedValue(undefined),
  mv: vi.fn().mockResolvedValue(undefined),
  stat: vi.fn().mockResolvedValue(null),
  exists: vi.fn().mockResolvedValue(false),
}));

import Terminal from './Terminal';

function getInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input')!;
}

describe('Terminal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the terminal header', () => {
    render(<Terminal />);
    expect(screen.getByText('WebOS Terminal v1.0')).toBeDefined();
  });

  it('renders the help prompt', () => {
    render(<Terminal />);
    expect(screen.getByText('Type "help" for available commands.')).toBeDefined();
  });

  it('renders the command input', () => {
    const { container } = render(<Terminal />);
    const input = getInput(container);
    expect(input).toBeDefined();
  });

  it('shows help text when help command is entered', async () => {
    const { container } = render(<Terminal />);
    const input = getInput(container);
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText(/Available commands/)).toBeDefined();
  });

  it('shows pwd output for pwd command', async () => {
    const { container } = render(<Terminal />);
    const input = getInput(container);
    fireEvent.change(input, { target: { value: 'pwd' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText('/')).toBeDefined();
  });

  it('shows whoami output', async () => {
    const { container } = render(<Terminal />);
    const input = getInput(container);
    fireEvent.change(input, { target: { value: 'whoami' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText('user')).toBeDefined();
  });
});
