# Data Model: Weather Panel (013)

**Date**: 2026-03-09
**Feature**: 013-weather-panel

## Overview

The weather panel is a **read-only, client-side feature** — no database schema changes required. All weather data is fetched from the Open-Meteo API and cached in IndexedDB for offline access. The existing `Conversation` entity already has `latitude` and `longitude` fields.

## New TypeScript Interfaces

### WeatherData (API response, normalized)

```typescript
interface WeatherData {
  /** Conversation this weather data belongs to */
  conversationId: string;
  /** Location coordinates (for cache validation) */
  latitude: number;
  longitude: number;
  /** Timezone resolved by API */
  timezone: string;
  timezoneAbbreviation: string;
  utcOffsetSeconds: number;
  /** Current conditions snapshot */
  current: WeatherCurrent;
  /** Hourly data points (past + today + forecast) */
  hourly: WeatherHourly[];
  /** When this data was fetched */
  fetchedAt: string; // ISO8601
}
```

### WeatherCurrent

```typescript
interface WeatherCurrent {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  precipitation: number;
}
```

### WeatherHourly

```typescript
interface WeatherHourly {
  /** ISO8601 time string in location timezone */
  time: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
}
```

### WeatherDaySummary (computed client-side from hourly data)

```typescript
interface WeatherDaySummary {
  /** Date label, e.g., "Mon", "Tue" */
  label: string;
  /** Date string, e.g., "10 Mar" */
  date: string;
  /** Min/max/avg temperatures for the day */
  temperatureMin: number;
  temperatureMax: number;
  temperatureAvg: number;
  /** Dominant weather code for the day */
  weatherCode: number;
  /** Total precipitation for the day (mm or in) */
  precipitation: number;
  /** Max wind speed for the day */
  windSpeed: number;
}
```

### WeatherUnits

```typescript
type UnitSystem = "metric" | "imperial";

interface WeatherUnits {
  temperature: "°C" | "°F";
  windSpeed: "km/h" | "mph";
  precipitation: "mm" | "in";
}
```

### WeatherPreferences (localStorage)

```typescript
interface WeatherPreferences {
  /** User-selected unit system, or null for auto-detect */
  unitOverride: UnitSystem | null;
}
```

**Storage key**: `geochat_weather_prefs`

### CachedWeatherData (IndexedDB)

```typescript
interface CachedWeatherData {
  /** Primary key: conversation ID */
  conversationId: string;
  /** The full weather data payload */
  data: WeatherData;
  /** When cached (for staleness check) */
  cachedAt: string; // ISO8601
}
```

### HistoricalAverage (IndexedDB, optional)

```typescript
interface CachedHistoricalAverage {
  /** Key: "{lat},{lng},{weekNumber}" */
  key: string;
  /** Average temperature for this location+week */
  temperatureAvg: number;
  /** When computed */
  cachedAt: string; // ISO8601
}
```

## IndexedDB Schema Changes

Extend the existing `GeoChatDB` schema in `src/lib/offline-db.ts`:

```typescript
// New object stores (DB_VERSION bump to 3)
weather: {
  key: string;           // conversationId
  value: CachedWeatherData;
}
historical_averages: {
  key: string;           // "{lat},{lng},{week}"
  value: CachedHistoricalAverage;
}
```

## Staleness Rules

| Data Type | Stale After | Delete After |
|-----------|-------------|--------------|
| Weather data | 1 hour | 7 days |
| Historical average | Never (seasonal) | 90 days |

## Entity Relationships

```
Conversation (existing)
  ├── latitude: number     (input to weather fetch)
  ├── longitude: number    (input to weather fetch)
  └── id: string           (key for weather cache)
        │
        ▼
  CachedWeatherData (IndexedDB)
  └── data: WeatherData
        ├── current: WeatherCurrent
        └── hourly: WeatherHourly[]
              │ (client-side aggregation)
              ▼
        WeatherDaySummary[] (computed, not stored)

  WeatherPreferences (localStorage)
  └── unitOverride: UnitSystem | null

  CachedHistoricalAverage (IndexedDB, optional)
  └── temperatureAvg: number
```

## No Database Changes

This feature requires **zero Supabase/PostgreSQL changes**. All data flows are:
- **Read**: Open-Meteo API → client
- **Cache**: Client → IndexedDB
- **Preferences**: Client → localStorage
