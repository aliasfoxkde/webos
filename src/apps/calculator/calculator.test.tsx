import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calculator } from './Calculator';

describe('Calculator', () => {
  it('renders the calculator buttons', () => {
    render(<Calculator />);
    expect(screen.getByText('C')).toBeDefined();
    expect(screen.getByText('CE')).toBeDefined();
    expect(screen.getByText('=')).toBeDefined();
  });

  it('renders digit and operator buttons', () => {
    render(<Calculator />);
    expect(screen.getByText('7')).toBeDefined();
    expect(screen.getByText('8')).toBeDefined();
    expect(screen.getByText('9')).toBeDefined();
    expect(screen.getByText('+')).toBeDefined();
    expect(screen.getByText('/')).toBeDefined();
    expect(screen.getByText('*')).toBeDefined();
  });

  it('renders percentage and clear buttons', () => {
    render(<Calculator />);
    expect(screen.getByText('%')).toBeDefined();
    expect(screen.getByText('C')).toBeDefined();
    expect(screen.getByText('CE')).toBeDefined();
  });

  it('has a display area', () => {
    const { container } = render(<Calculator />);
    // The main display is the bold 3xl text
    const display = container.querySelector('.font-bold.text-3xl');
    expect(display).toBeDefined();
    expect(display?.textContent).toBe('0');
  });

  it('has a grid of buttons', () => {
    const { container } = render(<Calculator />);
    const buttons = container.querySelectorAll('button');
    // Standard calculator has 20 buttons (4x5)
    expect(buttons.length).toBe(20);
  });

  it('responds to digit clicks by updating display', () => {
    const { container } = render(<Calculator />);
    const display = container.querySelector('.font-bold.text-3xl');
    fireEvent.click(screen.getByText('7'));
    expect(display?.textContent).toBe('7');
    fireEvent.click(screen.getByText('3'));
    expect(display?.textContent).toBe('73');
  });

  it('clears display on C click', () => {
    const { container } = render(<Calculator />);
    const display = container.querySelector('.font-bold.text-3xl');
    fireEvent.click(screen.getByText('7'));
    expect(display?.textContent).toBe('7');
    fireEvent.click(screen.getByText('C'));
    expect(display?.textContent).toBe('0');
  });
});
