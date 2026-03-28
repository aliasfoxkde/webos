import { useState, useEffect, useCallback } from 'react';
import {
  CITIES,
  fetchWeather,
  getConditionIcon,
  getConditionLabel,
  getBackgroundGradient,
} from './weather-data';
import type { CityWeather } from './weather-data';

export function Weather() {
  const [selectedCity, setSelectedCity] = useState(0);
  const [weather, setWeather] = useState<CityWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadWeather = useCallback(async (index: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(CITIES[index]);
      setWeather(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(selectedCity);
  }, [selectedCity, loadWeather]);

  const isDark = weather?.condition === 'stormy';

  if (error && !weather) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-[var(--os-bg-primary)]">
        <span className="text-4xl">🌤️</span>
        <p className="text-sm text-[var(--os-text-secondary)]">{error}</p>
        <button
          onClick={() => loadWeather(selectedCity)}
          className="rounded-lg px-4 py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: 'var(--os-accent)' }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--os-bg-primary)]">
        <p className="text-sm text-[var(--os-text-muted)]">Loading weather...</p>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: getBackgroundGradient(weather.condition) }}
    >
      {/* City selector */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(Number(e.target.value))}
          className="rounded-lg border px-3 py-1.5 text-sm outline-none"
          style={{
            borderColor: 'rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: isDark ? '#e5e7eb' : '#1f2937',
          }}
        >
          {CITIES.map((c, i) => (
            <option key={c.city} value={i}>
              {c.city}, {c.country}
            </option>
          ))}
        </select>
        {loading && (
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Updating...
          </span>
        )}
      </div>

      {/* Main weather display */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-4">
        <div
          className="text-6xl mb-2"
          role="img"
          aria-label={getConditionLabel(weather.condition)}
        >
          {getConditionIcon(weather.condition)}
        </div>

        <div
          className="text-5xl font-bold"
          style={{ color: isDark ? '#f9fafb' : '#ffffff' }}
        >
          {weather.temperature}&deg;C
        </div>

        <div
          className="text-lg font-medium mt-1"
          style={{ color: isDark ? '#d1d5db' : 'rgba(255,255,255,0.9)' }}
        >
          {getConditionLabel(weather.condition)}
        </div>

        <div
          className="text-sm mt-1"
          style={{ color: isDark ? '#9ca3af' : 'rgba(255,255,255,0.7)' }}
        >
          Feels like {weather.feelsLike}&deg;C
        </div>

        {/* Details */}
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <div
              className="text-xs font-medium"
              style={{ color: isDark ? '#9ca3af' : 'rgba(255,255,255,0.7)' }}
            >
              Humidity
            </div>
            <div
              className="text-sm font-semibold"
              style={{ color: isDark ? '#e5e7eb' : '#ffffff' }}
            >
              {weather.humidity}%
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-xs font-medium"
              style={{ color: isDark ? '#9ca3af' : 'rgba(255,255,255,0.7)' }}
            >
              Wind
            </div>
            <div
              className="text-sm font-semibold"
              style={{ color: isDark ? '#e5e7eb' : '#ffffff' }}
            >
              {weather.wind} km/h
            </div>
          </div>
        </div>

        {/* 5-day forecast */}
        <div
          className="mt-4 w-full rounded-xl p-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        >
          <div
            className="text-xs font-semibold mb-2 px-1"
            style={{ color: isDark ? '#d1d5db' : 'rgba(255,255,255,0.8)' }}
          >
            5-Day Forecast
          </div>
          <div className="flex justify-between">
            {weather.forecast.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-1">
                <span
                  className="text-xs font-medium"
                  style={{ color: isDark ? '#d1d5db' : 'rgba(255,255,255,0.8)' }}
                >
                  {day.day}
                </span>
                <span className="text-lg">{getConditionIcon(day.condition)}</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: isDark ? '#e5e7eb' : '#ffffff' }}
                >
                  {day.high}&deg;
                </span>
                <span
                  className="text-xs"
                  style={{ color: isDark ? '#9ca3af' : 'rgba(255,255,255,0.6)' }}
                >
                  {day.low}&deg;
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Last updated */}
        {lastUpdated && (
          <div
            className="text-[10px] mt-2"
            style={{ color: isDark ? '#9ca3af' : 'rgba(255,255,255,0.5)' }}
          >
            Updated {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
