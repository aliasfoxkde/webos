export interface DayForecast {
  day: string;
  high: number;
  low: number;
  condition: WeatherCondition;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'partly-cloudy';

export interface CityWeather {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  condition: WeatherCondition;
  humidity: number;
  wind: number;
  forecast: DayForecast[];
}

const CONDITION_ICONS: Record<WeatherCondition, string> = {
  'sunny': '\u2600\uFE0F',
  'partly-cloudy': '\u26C5',
  'cloudy': '\u2601\uFE0F',
  'rainy': '\uD83C\uDF27\uFE0F',
  'stormy': '\u26C8\uFE0F',
  'snowy': '\uD83C\uDF28\uFE0F',
};

const CONDITION_LABELS: Record<WeatherCondition, string> = {
  'sunny': 'Sunny',
  'partly-cloudy': 'Partly Cloudy',
  'cloudy': 'Cloudy',
  'rainy': 'Rainy',
  'stormy': 'Stormy',
  'snowy': 'Snowy',
};

export function getConditionIcon(condition: WeatherCondition): string {
  return CONDITION_ICONS[condition];
}

export function getConditionLabel(condition: WeatherCondition): string {
  return CONDITION_LABELS[condition];
}

export function getBackgroundGradient(condition: WeatherCondition): string {
  switch (condition) {
    case 'sunny':
      return 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)';
    case 'partly-cloudy':
      return 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 50%, #fbbf24 100%)';
    case 'cloudy':
      return 'linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)';
    case 'rainy':
      return 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #4b5563 100%)';
    case 'stormy':
      return 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)';
    case 'snowy':
      return 'linear-gradient(135deg, #93c5fd 0%, #dbeafe 50%, #e5e7eb 100%)';
  }
}

export const CITIES: CityWeather[] = [
  {
    city: 'San Francisco',
    country: 'US',
    temperature: 18,
    feelsLike: 16,
    condition: 'partly-cloudy',
    humidity: 72,
    wind: 19,
    forecast: [
      { day: 'Mon', high: 19, low: 13, condition: 'partly-cloudy' },
      { day: 'Tue', high: 21, low: 14, condition: 'sunny' },
      { day: 'Wed', high: 17, low: 12, condition: 'cloudy' },
      { day: 'Thu', high: 15, low: 11, condition: 'rainy' },
      { day: 'Fri', high: 18, low: 13, condition: 'partly-cloudy' },
    ],
  },
  {
    city: 'Tokyo',
    country: 'JP',
    temperature: 24,
    feelsLike: 26,
    condition: 'cloudy',
    humidity: 65,
    wind: 12,
    forecast: [
      { day: 'Mon', high: 25, low: 19, condition: 'cloudy' },
      { day: 'Tue', high: 23, low: 18, condition: 'rainy' },
      { day: 'Wed', high: 22, low: 17, condition: 'rainy' },
      { day: 'Thu', high: 26, low: 20, condition: 'partly-cloudy' },
      { day: 'Fri', high: 27, low: 21, condition: 'sunny' },
    ],
  },
  {
    city: 'London',
    country: 'GB',
    temperature: 12,
    feelsLike: 9,
    condition: 'rainy',
    humidity: 85,
    wind: 24,
    forecast: [
      { day: 'Mon', high: 13, low: 7, condition: 'rainy' },
      { day: 'Tue', high: 11, low: 6, condition: 'stormy' },
      { day: 'Wed', high: 10, low: 5, condition: 'cloudy' },
      { day: 'Thu', high: 12, low: 7, condition: 'partly-cloudy' },
      { day: 'Fri', high: 14, low: 8, condition: 'partly-cloudy' },
    ],
  },
  {
    city: 'New York',
    country: 'US',
    temperature: 22,
    feelsLike: 23,
    condition: 'sunny',
    humidity: 55,
    wind: 14,
    forecast: [
      { day: 'Mon', high: 24, low: 18, condition: 'sunny' },
      { day: 'Tue', high: 25, low: 19, condition: 'sunny' },
      { day: 'Wed', high: 23, low: 17, condition: 'partly-cloudy' },
      { day: 'Thu', high: 20, low: 15, condition: 'cloudy' },
      { day: 'Fri', high: 21, low: 16, condition: 'partly-cloudy' },
    ],
  },
  {
    city: 'Sydney',
    country: 'AU',
    temperature: 28,
    feelsLike: 30,
    condition: 'sunny',
    humidity: 48,
    wind: 16,
    forecast: [
      { day: 'Mon', high: 29, low: 22, condition: 'sunny' },
      { day: 'Tue', high: 30, low: 23, condition: 'sunny' },
      { day: 'Wed', high: 27, low: 21, condition: 'partly-cloudy' },
      { day: 'Thu', high: 26, low: 20, condition: 'rainy' },
      { day: 'Fri', high: 28, low: 22, condition: 'partly-cloudy' },
    ],
  },
  {
    city: 'Reykjavik',
    country: 'IS',
    temperature: 2,
    feelsLike: -3,
    condition: 'snowy',
    humidity: 78,
    wind: 32,
    forecast: [
      { day: 'Mon', high: 3, low: -2, condition: 'snowy' },
      { day: 'Tue', high: 1, low: -4, condition: 'snowy' },
      { day: 'Wed', high: 2, low: -3, condition: 'cloudy' },
      { day: 'Thu', high: 4, low: -1, condition: 'partly-cloudy' },
      { day: 'Fri', high: 3, low: -2, condition: 'snowy' },
    ],
  },
];
