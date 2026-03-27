import React, { useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Recursive-descent expression parser (no eval)
// ---------------------------------------------------------------------------

type Token =
  | { kind: 'number'; value: number }
  | { kind: 'op'; value: string }
  | { kind: 'lparen' }
  | { kind: 'rparen' };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i] as string;
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < input.length && /[0-9.]/.test(input[i] as string)) {
        num += input[i] as string;
        i++;
      }
      tokens.push({ kind: 'number', value: parseFloat(num) });
      continue;
    }
    if ('+-*/%'.includes(ch)) {
      tokens.push({ kind: 'op', value: ch });
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ kind: 'lparen' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ kind: 'rparen' });
      i++;
      continue;
    }
    i++; // skip unknown
  }
  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.pos = 0;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++]!;
  }

  /** expression := term (('+' | '-') term)* */
  private expression(): number {
    let result = this.term();
    let next = this.peek();
    while (next && next.kind === 'op' && (next.value === '+' || next.value === '-')) {
      const opVal = next.value;
      this.consume();
      const right = this.term();
      result = opVal === '+' ? result + right : result - right;
      next = this.peek();
    }
    return result;
  }

  /** term := factor (('*' | '/' | '%') factor)* */
  private term(): number {
    let result = this.factor();
    let next = this.peek();
    while (
      next && next.kind === 'op' &&
      (next.value === '*' || next.value === '/' || next.value === '%')
    ) {
      const opVal = next.value;
      this.consume();
      const right = this.factor();
      if (opVal === '*') result *= right;
      else if (opVal === '/') {
        if (right === 0) throw new Error('Division by zero');
        result /= right;
      } else {
        if (right === 0) throw new Error('Modulo by zero');
        result %= right;
      }
      next = this.peek();
    }
    return result;
  }

  /** factor := NUMBER | '(' expression ')' | ('+' | '-') factor */
  private factor(): number {
    const token = this.peek();
    if (!token) throw new Error('Unexpected end');

    if (token.kind === 'number') {
      this.consume();
      return token.value;
    }

    if (token.kind === 'lparen') {
      this.consume();
      const val = this.expression();
      if (this.peek()?.kind !== 'rparen') throw new Error('Missing )');
      this.consume();
      return val;
    }

    if (token.kind === 'op' && (token.value === '+' || token.value === '-')) {
      this.consume();
      const val = this.factor();
      return token.value === '-' ? -val : val;
    }

    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }

  parse(): number {
    const result = this.expression();
    if (this.pos < this.tokens.length) throw new Error('Unexpected trailing input');
    return result;
  }
}

function evaluate(expr: string): number {
  const tokens = tokenize(expr);
  if (tokens.length === 0) return 0;
  return new Parser(tokens).parse();
}

// ---------------------------------------------------------------------------
// Format display value
// ---------------------------------------------------------------------------

function formatDisplay(value: number, isResult: boolean): string {
  if (!isFinite(value)) return 'Error';
  // If it's a result and the number is an integer, show without decimals
  if (isResult && Number.isInteger(value) && Math.abs(value) < 1e15) {
    return value.toLocaleString('en-US');
  }
  // Otherwise limit to 12 significant digits
  const str = parseFloat(value.toPrecision(12)).toString();
  if (str.length > 16) return value.toExponential(6);
  return str;
}

// ---------------------------------------------------------------------------
// Button definitions
// ---------------------------------------------------------------------------

interface CalcButton {
  label: string;
  action: () => void;
  span?: number; // grid column span
  variant?: 'operator' | 'function' | 'equals';
}

// ---------------------------------------------------------------------------
// Calculator component
// ---------------------------------------------------------------------------

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevResult, setPrevResult] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const appendDigit = useCallback(
    (digit: string) => {
      if (hasError) {
        setDisplay(digit);
        setExpression(digit);
        setHasError(false);
        setPrevResult(null);
        setWaitingForOperand(false);
        return;
      }
      if (waitingForOperand) {
        setDisplay(digit);
        setExpression((prev) => prev + digit);
        setWaitingForOperand(false);
      } else {
        // Prevent leading zeros (but allow "0.")
        if (display === '0' && digit !== '.') {
          setDisplay(digit);
          setExpression((prev) => {
            // Replace trailing 0 or add
            if (prev.endsWith('0') && /[+\-*/%()]/.test(prev.slice(0, -1))) {
              return prev.slice(0, -1) + digit;
            }
            return prev + digit;
          });
        } else {
          setDisplay((prev) => prev + digit);
          setExpression((prev) => prev + digit);
        }
      }
    },
    [display, hasError, waitingForOperand],
  );

  const appendDecimal = useCallback(() => {
    if (hasError) {
      setDisplay('0.');
      setExpression('0.');
      setHasError(false);
      setPrevResult(null);
      return;
    }
    if (waitingForOperand) {
      setDisplay('0.');
      setExpression((prev) => prev + '0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay((prev) => prev + '.');
      setExpression((prev) => prev + '.');
    }
  }, [display, hasError, waitingForOperand]);

  const appendOperator = useCallback(
    (op: string) => {
      if (hasError) return;
      setWaitingForOperand(true);
      // If there's a pending result, use it
      if (prevResult !== null && waitingForOperand) {
        setExpression(prevResult.toString() + op);
        setDisplay(formatDisplay(prevResult, false));
        setPrevResult(null);
        return;
      }
      // Replace trailing operator
      const lastOp = expression.slice(-1);
      if ('+-*/%'.includes(lastOp)) {
        setExpression((prev) => prev.slice(0, -1) + op);
      } else {
        setExpression((prev) => prev + op);
      }
    },
    [expression, hasError, prevResult, waitingForOperand],
  );

  const calculate = useCallback(() => {
    try {
      const result = evaluate(expression || display);
      setPrevResult(result);
      setDisplay(formatDisplay(result, true));
      setExpression(formatDisplay(result, true));
      setWaitingForOperand(true);
      setHasError(false);
    } catch {
      setDisplay('Error');
      setHasError(true);
    }
  }, [expression, display]);

  const clear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setPrevResult(null);
    setHasError(false);
    setWaitingForOperand(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
    if (hasError) {
      setExpression('');
      setHasError(false);
      setPrevResult(null);
    }
    setWaitingForOperand(false);
  }, [hasError]);

  const toggleSign = useCallback(() => {
    if (display === '0' || display === 'Error') return;
    const num = parseFloat(display);
    const toggled = -num;
    setDisplay(formatDisplay(toggled, false));
    // Update the trailing number in expression
    const match = expression.match(/([\d.]+)$/);
    const captured = match?.[1] ?? '';
    if (captured) {
      setExpression((prev) => prev.slice(0, -captured.length) + formatDisplay(toggled, false));
    }
  }, [display, expression]);

  const percentage = useCallback(() => {
    if (display === 'Error') return;
    const num = parseFloat(display);
    const result = num / 100;
    setDisplay(formatDisplay(result, true));
    // Update expression
    const match = expression.match(/([\d.]+)$/);
    const captured = match?.[1] ?? '';
    if (captured) {
      setExpression((prev) => prev.slice(0, -captured.length) + formatDisplay(result, true));
    }
  }, [display, expression]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        appendDigit(e.key);
      } else if (e.key === '.') {
        appendDecimal();
      } else if ('+-*/%'.includes(e.key)) {
        appendOperator(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
      } else if (e.key === 'Escape') {
        clear();
      } else if (e.key === 'Backspace') {
        clearEntry();
      }
    },
    [appendDigit, appendDecimal, appendOperator, calculate, clear, clearEntry],
  );

  const buttons: CalcButton[][] = [
    [
      { label: 'C', action: clear, variant: 'function' },
      { label: 'CE', action: clearEntry, variant: 'function' },
      { label: '%', action: percentage, variant: 'function' },
      { label: '/', action: () => appendOperator('/'), variant: 'operator' },
    ],
    [
      { label: '7', action: () => appendDigit('7') },
      { label: '8', action: () => appendDigit('8') },
      { label: '9', action: () => appendDigit('9') },
      { label: '*', action: () => appendOperator('*'), variant: 'operator' },
    ],
    [
      { label: '4', action: () => appendDigit('4') },
      { label: '5', action: () => appendDigit('5') },
      { label: '6', action: () => appendDigit('6') },
      { label: '-', action: () => appendOperator('-'), variant: 'operator' },
    ],
    [
      { label: '1', action: () => appendDigit('1') },
      { label: '2', action: () => appendDigit('2') },
      { label: '3', action: () => appendDigit('3') },
      { label: '+', action: () => appendOperator('+'), variant: 'operator' },
    ],
    [
      { label: '+/-', action: toggleSign, variant: 'function' },
      { label: '0', action: () => appendDigit('0') },
      { label: '.', action: appendDecimal },
      { label: '=', action: calculate, variant: 'equals' },
    ],
  ];

  const btnClass = (variant?: string) => {
    const base =
      'flex items-center justify-center rounded-lg font-semibold text-lg transition-colors duration-100 select-none cursor-pointer active:scale-95';
    switch (variant) {
      case 'operator':
        return `${base} bg-[var(--os-accent)] text-white hover:bg-[var(--os-accent-hover)]`;
      case 'function':
        return `${base} bg-[var(--os-bg-tertiary)] text-[var(--os-text-primary)] hover:bg-[var(--os-bg-hover)]`;
      case 'equals':
        return `${base} bg-[var(--os-accent)] text-white hover:bg-[var(--os-accent-hover)]`;
      default:
        return `${base} bg-[var(--os-bg-secondary)] text-[var(--os-text-primary)] hover:bg-[var(--os-bg-tertiary)]`;
    }
  };

  return (
    <div
      className="flex h-full flex-col p-3"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Display */}
      <div
        className="mb-3 flex flex-col items-end rounded-lg p-4"
        style={{ backgroundColor: 'var(--os-bg-secondary)' }}
      >
        <div
          className="min-h-[1.25rem] text-right text-sm"
          style={{ color: 'var(--os-text-muted)' }}
        >
          {expression || '\u00A0'}
        </div>
        <div
          className={`mt-1 text-right text-3xl font-bold tabular-nums ${hasError ? 'text-[var(--os-error)]' : ''}`}
          style={hasError ? {} : { color: 'var(--os-text-primary)' }}
        >
          {display}
        </div>
      </div>

      {/* Buttons grid */}
      <div className="flex-1 grid grid-cols-4 gap-2">
        {buttons.flat().map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={btnClass(btn.variant)}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
