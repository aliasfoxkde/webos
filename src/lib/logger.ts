type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_STYLES: Record<LogLevel, string> = {
  debug: 'color: #6b7280',
  info: 'color: #3b82f6',
  warn: 'color: #f59e0b',
  error: 'color: #ef4444',
};

let globalLevel: LogLevel = 'warn';

function resolveLevel(): LogLevel {
  try {
    const stored = localStorage.getItem('webos-debug');
    if (stored === 'true') return 'debug';
    if (stored === 'info') return 'info';
    if (stored === 'warn') return 'warn';
    if (stored === 'error') return 'error';
  } catch {
    // localStorage unavailable (SSR, tests)
  }
  return globalLevel;
}

function timestamp(): string {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[resolveLevel()];
}

function log(level: LogLevel, module: string, message: string, ...data: unknown[]): void {
  if (!shouldLog(level)) return;
  const ts = timestamp();
  const prefix = `%c[${ts}]%c %c${level.toUpperCase()}%c %c[${module}]%c ${message}`;
  const styles = [
    'color: #9ca3af',         // timestamp
    '',                         // reset
    LEVEL_STYLES[level],        // level
    '',                         // reset
    'color: #a78bfa; font-weight: bold', // module
    '',                         // reset
  ];
  console.log(prefix, ...styles, ...data);
}

export function setLogLevel(level: LogLevel): void {
  globalLevel = level;
}

export function createLogger(module: string) {
  return {
    debug: (msg: string, ...data: unknown[]) => log('debug', module, msg, ...data),
    info: (msg: string, ...data: unknown[]) => log('info', module, msg, ...data),
    warn: (msg: string, ...data: unknown[]) => log('warn', module, msg, ...data),
    error: (msg: string, ...data: unknown[]) => log('error', module, msg, ...data),
  };
}
