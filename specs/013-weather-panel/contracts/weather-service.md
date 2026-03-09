# Weather Service Contract

**Feature**: 013-weather-panel
**Date**: 2026-03-09

## Overview

The weather panel consumes one external API (Open-Meteo) and exposes one internal service interface consumed by React components via a custom hook.

## External API: Open-Meteo Forecast

### Request

```
GET https://api.open-meteo.com/v1/forecast
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | Yes | WGS84 latitude from conversation |
| `longitude` | float | Yes | WGS84 longitude from conversation |
| `past_days` | int | Yes | Fixed: `4` |
| `forecast_days` | int | Yes | Fixed: `4` |
| `hourly` | string | Yes | `temperature_2m,precipitation,wind_speed_10m,weather_code` |
| `current` | string | Yes | `temperature_2m,weather_code,wind_speed_10m,precipitation` |
| `timezone` | string | Yes | Fixed: `auto` |
| `temperature_unit` | string | Yes | `celsius` or `fahrenheit` (from user preference) |
| `wind_speed_unit` | string | Yes | `kmh` or `mph` (from user preference) |
| `precipitation_unit` | string | Yes | `mm` or `inch` (from user preference) |

### Response (200 OK)

```json
{
  "latitude": 45.034,
  "longitude": 6.404,
  "elevation": 2058.0,
  "generationtime_ms": 2.1,
  "utc_offset_seconds": 3600,
  "timezone": "Europe/Paris",
  "timezone_abbreviation": "CET",
  "current_units": {
    "temperature_2m": "°C",
    "weather_code": "wmo code",
    "wind_speed_10m": "km/h",
    "precipitation": "mm"
  },
  "current": {
    "time": "2026-03-09T14:00",
    "temperature_2m": 4.2,
    "weather_code": 61,
    "wind_speed_10m": 22.0,
    "precipitation": 1.3
  },
  "hourly_units": {
    "time": "iso8601",
    "temperature_2m": "°C",
    "precipitation": "mm",
    "wind_speed_10m": "km/h",
    "weather_code": "wmo code"
  },
  "hourly": {
    "time": ["2026-03-05T00:00", "2026-03-05T01:00", "..."],
    "temperature_2m": [-2.1, -2.5, "..."],
    "precipitation": [0.0, 0.1, "..."],
    "wind_speed_10m": [15.2, 14.8, "..."],
    "weather_code": [71, 71, "..."]
  }
}
```

### Error Handling

| Status | Meaning | Panel Behavior |
|--------|---------|----------------|
| 200 | Success | Render weather data |
| 400 | Invalid parameters | Show "Weather unavailable" (FR-018) |
| 429 | Rate limited | Show "Weather temporarily unavailable", retry after delay |
| 5xx | Server error | Show cached data if available, else "Weather unavailable" |
| Network error | Offline/timeout | Show cached data with staleness indicator (FR-016/FR-020) |

## External API: Open-Meteo Archive (Historical Average)

### Request

```
GET https://archive-api.open-meteo.com/v1/archive
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | Yes | WGS84 latitude |
| `longitude` | float | Yes | WGS84 longitude |
| `start_date` | string | Yes | ISO8601 date (same calendar week, 5 years back) |
| `end_date` | string | Yes | ISO8601 date |
| `daily` | string | Yes | `temperature_2m_mean` |
| `timezone` | string | Yes | Fixed: `auto` |

### Response (200 OK)

```json
{
  "daily": {
    "time": ["2021-03-08", "2021-03-09", "..."],
    "temperature_2m_mean": [1.2, 2.1, "..."]
  }
}
```

### Error Handling

| Status | Meaning | Panel Behavior |
|--------|---------|----------------|
| Any error | Failure | Omit historical reference line silently (spec allows) |

## Internal Service Interface: useWeather Hook

### Input

```typescript
useWeather(conversationId: string, latitude: number, longitude: number): UseWeatherResult
```

### Output

```typescript
interface UseWeatherResult {
  /** Normalized weather data (null while loading or on error) */
  weather: WeatherData | null;
  /** Historical average temp for this location+week (null if unavailable) */
  historicalAvg: number | null;
  /** Loading state */
  loading: boolean;
  /** Error message (null on success) */
  error: string | null;
  /** Whether showing cached/stale data */
  isStale: boolean;
  /** When data was last fetched */
  lastUpdated: Date | null;
  /** Trigger manual refresh */
  refresh: () => Promise<void>;
}
```

### Behavior Contract

1. On mount: check IndexedDB cache → if fresh (<1h), use cached data; else fetch from API
2. On fetch success: normalize response → update state → cache in IndexedDB
3. On fetch failure + cache exists: serve stale cache, set `isStale: true`
4. On fetch failure + no cache: set `error` message
5. `refresh()`: re-fetch regardless of cache freshness
6. If `navigator.onLine === false`: serve cache, disable refresh

### Unit Preference Interface

```typescript
useWeatherUnits(): {
  units: WeatherUnits;
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
}
```

Reads from `localStorage('geochat_weather_prefs')`, falls back to locale detection via `navigator.language`.
