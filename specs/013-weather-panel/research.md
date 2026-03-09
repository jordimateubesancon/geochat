# Research: Weather Panel (013)

**Date**: 2026-03-09
**Feature**: 013-weather-panel

## Decision 1: Weather Data Provider

**Decision**: Open-Meteo Forecast API (`https://api.open-meteo.com/v1/forecast`)

**Rationale**:
- Free, open-source, no API key required — satisfies Constitution Principle I (Zero-Budget)
- Single endpoint covers past data (`past_days=4`), current conditions (`current=...`), and forecast (`forecast_days=4`)
- Built-in timezone resolution (`timezone=auto`) — satisfies FR-020
- Built-in unit conversion (`temperature_unit`, `wind_speed_unit`, `precipitation_unit`) — satisfies FR-013/FR-014
- No CORS issues — can call directly from the browser
- Free tier: 10,000 calls/day, 600/minute — more than sufficient

**Alternatives considered**:
- **OpenWeatherMap**: Requires API key, free tier limited to 1,000 calls/day, no past data in free tier
- **WeatherAPI.com**: Requires API key, limited free tier, proprietary
- **Visual Crossing**: Requires API key, 1,000 calls/day free tier

## Decision 2: Historical Average Temperature

**Decision**: Use Open-Meteo Archive API to compute seasonal averages on-demand, with client-side caching. Fall back to omitting the reference line if unavailable.

**Rationale**:
- The Climate API requires a paid plan — violates Constitution Principle I
- The Archive API (`https://archive-api.open-meteo.com/v1/archive`) is free and covers data from 1940–present
- Compute historical average: fetch same calendar week across past 5 years, average the daily `temperature_2m_mean`
- Cache the computed average per location+week in IndexedDB to avoid repeat calls
- If the archive call fails or takes too long, simply omit the reference line (spec allows this)

**Alternatives considered**:
- **Climate API**: Pre-computed climate model data, but requires paid plan
- **Hardcoded seasonal estimates**: Simpler but inaccurate for diverse locations
- **Skip entirely**: Would lose the P3 user story value

## Decision 3: API Call Strategy

**Decision**: Single Forecast API call per conversation open, combining past + current + forecast data. Separate Archive API call (lazy, cached) for historical average.

**Rationale**:
- One call: `past_days=4&forecast_days=4&hourly=temperature_2m,precipitation,wind_speed_10m,weather_code&current=temperature_2m,weather_code,wind_speed_10m,precipitation&timezone=auto`
- Returns all data needed for the summary bar + full timeline in one response
- Historical average call is deferred (only when timeline is expanded) and heavily cached
- Manual refresh (FR-012) re-fires the same single call

**Alternatives considered**:
- **Multiple API calls** (current + hourly + daily separately): More requests, no benefit
- **Server-side proxy**: Adds backend complexity for no gain — the API is free and CORS-enabled

## Decision 4: Offline Caching Strategy

**Decision**: Cache weather API responses in IndexedDB using the existing `idb` library pattern from 008-offline-mode. Key by conversation ID.

**Rationale**:
- Consistent with existing offline caching architecture (`src/lib/offline-db.ts`)
- Store: `{ conversationId, latitude, longitude, data, cachedAt }`
- On offline: serve cached data + show staleness indicator (FR-016/FR-020)
- Stale after 1 hour (weather changes); delete after 7 days (via existing `deleteStaleData` pattern)

**Alternatives considered**:
- **Cache Storage API (Service Worker)**: More complex, not needed for structured JSON data
- **localStorage**: Size limits (5MB), no structured queries, wrong tool for the job

## Decision 5: Unit System Detection

**Decision**: Use `navigator.language` to detect locale, map to metric/imperial, store override in localStorage.

**Rationale**:
- `navigator.language` returns locale codes (e.g., `en-US`, `fr-FR`)
- US/Liberia/Myanmar locales → imperial; all others → metric
- Pass directly to Open-Meteo API parameters: `temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
- Store preference as `geochat_weather_units` in localStorage (parallel to existing `geochat_accessibility_prefs` pattern)

**Alternatives considered**:
- **Extend AccessibilityPreferences**: Mixing concerns; weather units aren't an accessibility feature
- **Always metric**: Simpler but excludes US users (spec decided on auto-detect + override)

## Decision 6: WMO Weather Code to Icon Mapping

**Decision**: Client-side mapping from WMO code table 4677 to emoji icons + condition labels.

**Rationale**:
- Open-Meteo returns integer WMO codes (0, 1, 2, 3, 45, 51, 61, 71, 80, 95, etc.)
- Map to condition categories: Clear (0-1), Partly Cloudy (2), Overcast (3), Fog (45-48), Drizzle (51-57), Rain (61-67), Snow (71-77), Showers (80-86), Thunderstorm (95-99)
- Use emoji for icons (consistent with mockup): ☀️, ⛅, ☁️, 🌫️, 🌦️, 🌧️, 🌨️, ⛈️
- i18n: condition labels translated via next-intl; emojis are universal

**Alternatives considered**:
- **SVG icon set**: Higher fidelity but adds dependency and bundle size
- **Open-Meteo icon URLs**: No such feature exists in the API

## Decision 7: Sparkline Rendering

**Decision**: Inline SVG rendered in React, using bezier curves computed from temperature data points.

**Rationale**:
- No charting library needed — the sparkline is a single SVG path with gradient fills
- Consistent with mockup approach (pure SVG, no dependencies)
- Satisfies Constitution Principle II (minimal dependencies) and III (simplest thing that works)
- Accessibility: SVG includes ARIA labels for screen readers

**Alternatives considered**:
- **Chart.js / Recharts**: Overkill for a single sparkline; adds ~50-200KB bundle
- **Canvas**: Not SSR-friendly, harder to style with Tailwind, no DOM for accessibility
- **CSS-only sparkline**: Too limited for bezier curves and gradients

## Open-Meteo API Reference

### Forecast API Call (single request for all panel data)

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lng}
  &past_days=4
  &forecast_days=4
  &hourly=temperature_2m,precipitation,wind_speed_10m,weather_code
  &current=temperature_2m,weather_code,wind_speed_10m,precipitation
  &timezone=auto
  &temperature_unit={celsius|fahrenheit}
  &wind_speed_unit={kmh|mph}
  &precipitation_unit={mm|inch}
```

### Archive API Call (historical average, cached)

```
GET https://archive-api.open-meteo.com/v1/archive
  ?latitude={lat}
  &longitude={lng}
  &start_date={5 years of same-week dates}
  &end_date={...}
  &daily=temperature_2m_mean
  &timezone=auto
```

### WMO Weather Codes (subset used)

| Code | Category | Emoji | Label Key |
|------|----------|-------|-----------|
| 0 | Clear sky | ☀️ | weather.clear |
| 1 | Mainly clear | ☀️ | weather.mainlyClear |
| 2 | Partly cloudy | ⛅ | weather.partlyCloudy |
| 3 | Overcast | ☁️ | weather.overcast |
| 45, 48 | Fog | 🌫️ | weather.fog |
| 51, 53, 55 | Drizzle | 🌦️ | weather.drizzle |
| 56, 57 | Freezing drizzle | 🌦️ | weather.freezingDrizzle |
| 61, 63 | Rain | 🌧️ | weather.rain |
| 65 | Heavy rain | 🌧️ | weather.heavyRain |
| 66, 67 | Freezing rain | 🌧️ | weather.freezingRain |
| 71, 73 | Snowfall | 🌨️ | weather.snow |
| 75 | Heavy snowfall | ❄️ | weather.heavySnow |
| 77 | Snow grains | 🌨️ | weather.snowGrains |
| 80, 81, 82 | Rain showers | ⛈️ | weather.rainShowers |
| 85, 86 | Snow showers | 🌨️ | weather.snowShowers |
| 95 | Thunderstorm | ⛈️ | weather.thunderstorm |
| 96, 99 | Thunderstorm + hail | ⛈️ | weather.thunderstormHail |

### Free Tier Limits

| Window | Limit |
|--------|-------|
| Per minute | 600 |
| Per hour | 5,000 |
| Per day | 10,000 |
