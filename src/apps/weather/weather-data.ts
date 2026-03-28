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

export interface CityInfo {
  city: string;
  country: string;
  lat: number;
  lon: number;
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

export const CITIES: CityInfo[] = [
  { city: 'San Francisco', country: 'US', lat: 37.77, lon: -122.42 },
  { city: 'Tokyo', country: 'JP', lat: 35.68, lon: 139.69 },
  { city: 'London', country: 'GB', lat: 51.51, lon: -0.13 },
  { city: 'New York', country: 'US', lat: 40.71, lon: -74.01 },
  { city: 'Sydney', country: 'AU', lat: -33.87, lon: 151.21 },
  { city: 'Reykjavik', country: 'IS', lat: 64.15, lon: -21.94 },
];

const WMO_TO_CONDITION: Record<number, WeatherCondition> = {
  0: 'sunny',
  1: 'partly-cloudy',
  2: 'partly-cloudy',
  3: 'cloudy',
  45: 'cloudy',
  48: 'cloudy',
  51: 'rainy',
  53: 'rainy',
  55: 'rainy',
  56: 'rainy',
  57: 'rainy',
  61: 'rainy',
  63: 'rainy',
 65: 'rainy',
 66: 'rainy',
 67: 'rainy',
 71: 'snowy',
 73: 'snowy',
 75: 'snowy',
 77: 'snowy',
 80: 'rainy',
 81: 'rainy',
 82: 'stormy',
 85: 'stormy',
 86: 'snowy',
 95: 'stormy',
 96: 'stormy',
 99: 'stormy',
};

function wmoToCondition(code: number): WeatherCondition {
  return WMO_TO_CONDITION[code] ?? 'cloudy';
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export async function fetchWeather(info: CityInfo): Promise<CityWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${info.lat}&longitude=${info.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

  const data: OpenMeteoResponse = await res.json();

  const condition = wmoToCondition(data.current.weather_code);

  const forecast: DayForecast[] = data.daily.time.slice(0, 5).map((dateStr, i) => {
    const d = new Date(dateStr + 'T12:00:00');
    return {
      day: DAY_NAMES[d.getDay()],
      high: Math.round(data.daily.temperature_2m_max[i]),
      low: Math.round(data.daily.temperature_2m_min[i]),
      condition: wmoToCondition(data.daily.weather_code[i]),
    };
  });

  return {
    city: info.city,
    country: info.country,
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    condition,
    humidity: data.current.relative_humidity_2m,
    wind: Math.round(data.current.wind_speed_10m),
    forecast,
  };
}
