import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Weather } from './Weather';

describe('Weather', () => {
  it('renders the city selector', () => {
    render(<Weather />);
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('renders temperature display', () => {
    render(<Weather />);
    // Default city should show its temperature value
    expect(screen.getAllByText(/°C/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders humidity and wind details', () => {
    render(<Weather />);
    expect(screen.getByText('Humidity')).toBeDefined();
    expect(screen.getByText('Wind')).toBeDefined();
  });

  it('renders 5-day forecast section', () => {
    render(<Weather />);
    expect(screen.getByText('5-Day Forecast')).toBeDefined();
  });

  it('renders feels-like info', () => {
    render(<Weather />);
    expect(screen.getByText(/Feels like/)).toBeDefined();
  });
});
