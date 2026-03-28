import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { mockWeather } = vi.hoisted(() => ({
  mockWeather: {
    city: 'San Francisco',
    country: 'US',
    temperature: 18,
    feelsLike: 16,
    condition: 'partly-cloudy' as const,
    humidity: 72,
    wind: 19,
    forecast: [
      { day: 'Mon', high: 19, low: 13, condition: 'partly-cloudy' as const },
      { day: 'Tue', high: 21, low: 14, condition: 'sunny' as const },
      { day: 'Wed', high: 17, low: 12, condition: 'cloudy' as const },
      { day: 'Thu', high: 15, low: 11, condition: 'rainy' as const },
      { day: 'Fri', high: 18, low: 13, condition: 'partly-cloudy' as const },
    ],
  },
}));

vi.mock('./weather-data', () => ({
  CITIES: [
    { city: 'San Francisco', country: 'US', lat: 37.77, lon: -122.42 },
    { city: 'Tokyo', country: 'JP', lat: 35.68, lon: 139.69 },
  ],
  getConditionIcon: (c: string) => c,
  getConditionLabel: (c: string) => c,
  getBackgroundGradient: () => 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)',
  fetchWeather: vi.fn().mockResolvedValue(mockWeather),
}));

import { fetchWeather } from './weather-data';
import { Weather } from './Weather';

const mockedFetchWeather = vi.mocked(fetchWeather);

describe('Weather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<Weather />);
    expect(screen.getByText('Loading weather...')).toBeDefined();
  });

  it('renders temperature display after load', async () => {
    render(<Weather />);
    expect(await screen.findByText(/18°C/)).toBeDefined();
  });

  it('renders humidity and wind details', async () => {
    render(<Weather />);
    expect(await screen.findByText('Humidity')).toBeDefined();
    expect(await screen.findByText('Wind')).toBeDefined();
  });

  it('renders 5-day forecast section', async () => {
    render(<Weather />);
    expect(await screen.findByText('5-Day Forecast')).toBeDefined();
  });

  it('renders feels-like info', async () => {
    render(<Weather />);
    expect(await screen.findByText(/Feels like/)).toBeDefined();
  });

  it('shows error state on fetch failure', async () => {
    mockedFetchWeather.mockRejectedValueOnce(new Error('Network error'));
    render(<Weather />);
    expect(await screen.findByText('Network error')).toBeDefined();
    expect(screen.getByText('Retry')).toBeDefined();
  });
});
