import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  readdir,
  writeFile,
  readFile,
  mkdir,
  rm,
  stat,
  exists,
} from '@/vfs/vfs';
import type { FileNode } from '@/vfs/types';

interface Line {
  text: string;
  isCommand?: boolean;
}

function resolveDir(cwd: string, target: string): string {
  if (target === '/') return '/';
  if (target.startsWith('/')) {
    // absolute
    const parts = target.split('/').filter(Boolean);
    const resolved: string[] = [];
    for (const p of parts) {
      if (p === '..') resolved.pop();
      else if (p !== '.') resolved.push(p);
    }
    return '/' + resolved.join('/');
  }
  // relative
  const base = cwd === '/' ? [] : cwd.split('/').filter(Boolean);
  const parts = target.split('/').filter(Boolean);
  const resolved = [...base];
  for (const p of parts) {
    if (p === '..') resolved.pop();
    else if (p !== '.') resolved.push(p);
  }
  return '/' + resolved.join('/');
}

const HELP_TEXT = `Available commands:
  ls [path]         List directory contents
  cd <path>         Change directory
  pwd               Print working directory
  cat <file>        Display file contents
  mkdir <path>      Create directory
  rm <path>         Remove file or directory
  touch <file>      Create empty file
  echo <text>       Print text
  whoami            Print current user
  date              Print current date/time
  clear             Clear terminal
  help              Show this help message`;

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { text: 'WebOS Terminal v1.0', isCommand: false },
    { text: 'Type "help" for available commands.', isCommand: false },
    { text: '', isCommand: false },
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [tempInput, setTempInput] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollBottom = useCallback(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [lines, scrollBottom]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const addOutput = useCallback((text: string) => {
    setLines((prev) => [...prev, { text, isCommand: false }]);
  }, []);

  const addError = useCallback((text: string) => {
    setLines((prev) => [...prev, { text: `Error: ${text}`, isCommand: false }]);
  }, []);

  const executeCommand = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        setLines((prev) => [...prev, { text: '', isCommand: false }]);
        return;
      }

      const prompt = `${cwd === '/' ? '/' : cwd} $ `;
      setLines((prev) => [
        ...prev,
        { text: `${prompt}${trimmed}`, isCommand: true },
      ]);
      setHistory((prev) => [...prev, trimmed]);
      setHistoryIdx(-1);
      setTempInput('');

      const args = trimmed.split(/\s+/);
      const cmd = (args[0] ?? '').toLowerCase();
      const rest = args.slice(1);

      try {
        switch (cmd) {
          case 'ls': {
            const target = rest[0] ? resolveDir(cwd, rest[0]) : cwd;
            const entries = await readdir(target);
            if (entries.length === 0) {
              addOutput('(empty)');
            } else {
              const sorted = entries.sort((a, b) => {
                if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                return a.name.localeCompare(b.name);
              });
              const formatted = sorted
                .map((e: FileNode) =>
                  e.type === 'folder' ? `${e.name}/` : e.name,
                )
                .join('  ');
              addOutput(formatted);
            }
            break;
          }

          case 'cd': {
            if (!rest[0] || rest[0] === '~') {
              setCwd('/');
            } else {
              const target = resolveDir(cwd, rest[0]);
              const node = await stat(target);
              if (!node) {
                addError(`no such directory: ${rest[0]}`);
              } else if (node.type !== 'folder') {
                addError(`not a directory: ${rest[0]}`);
              } else {
                setCwd(target);
              }
            }
            break;
          }

          case 'pwd': {
            addOutput(cwd);
            break;
          }

          case 'cat': {
            if (!rest[0]) {
              addError('usage: cat <file>');
              break;
            }
            const target = resolveDir(cwd, rest[0]);
            const node = await readFile(target);
            if (!node) {
              addError(`no such file: ${rest[0]}`);
            } else if (node.type === 'folder') {
              addError(`is a directory: ${rest[0]}`);
            } else if (node.content instanceof ArrayBuffer) {
              addOutput('[binary file]');
            } else {
              addOutput(node.content ?? '');
            }
            break;
          }

          case 'mkdir': {
            if (!rest[0]) {
              addError('usage: mkdir <path>');
              break;
            }
            const target = resolveDir(cwd, rest[0]);
            const parentDir = target.substring(0, target.lastIndexOf('/')) || '/';
            if (!(await exists(parentDir))) {
              addError(`parent directory does not exist: ${parentDir}`);
            } else {
              await mkdir(target);
            }
            break;
          }

          case 'rm': {
            if (!rest[0]) {
              addError('usage: rm <path>');
              break;
            }
            const target = resolveDir(cwd, rest[0]);
            if (!(await exists(target))) {
              addError(`no such file or directory: ${rest[0]}`);
            } else {
              await rm(target);
            }
            break;
          }

          case 'touch': {
            if (!rest[0]) {
              addError('usage: touch <file>');
              break;
            }
            const target = resolveDir(cwd, rest[0]);
            if (!(await exists(target))) {
              await writeFile(target, '');
            }
            break;
          }

          case 'echo': {
            addOutput(rest.join(' '));
            break;
          }

          case 'whoami': {
            addOutput('user');
            break;
          }

          case 'date': {
            addOutput(new Date().toString());
            break;
          }

          case 'clear': {
            setLines([]);
            return;
          }

          case 'help': {
            addOutput(HELP_TEXT);
            break;
          }

          default: {
            addError(`command not found: ${cmd}`);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        addError(message);
      }
    },
    [cwd, addOutput, addError],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = input;
      setInput('');
      executeCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const newIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      if (historyIdx === -1) setTempInput(input);
      setHistoryIdx(newIdx);
      setInput(history[newIdx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      if (historyIdx >= history.length - 1) {
        setHistoryIdx(-1);
        setInput(tempInput);
      } else {
        const newIdx = historyIdx + 1;
        setHistoryIdx(newIdx);
        setInput(history[newIdx] ?? '');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const prompt = `${cwd === '/' ? '/' : cwd} $ `;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1a1a2e',
        fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", "Courier New", monospace',
        fontSize: '13px',
        color: '#00ff88',
        overflow: 'hidden',
      }}
      onClick={focusInput}
    >
      <div
        ref={outputRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 10px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          lineHeight: '1.4',
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              color: line.isCommand ? '#888' : line.text.startsWith('Error:') ? '#ff4444' : '#00ff88',
            }}
          >
            {line.text}
          </div>
        ))}
        {/* Current input line */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#00ccff', whiteSpace: 'pre' }}>{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#00ff88',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              padding: 0,
              margin: 0,
              caretColor: '#00ff88',
            }}
          />
        </div>
      </div>
    </div>
  );
}
