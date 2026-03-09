# Quickstart: Weather Panel (013)

**Feature**: 013-weather-panel
**Date**: 2026-03-09

## Prerequisites

- Node.js 18+ and npm
- Existing geochat dev environment (`npm install` already done)
- No additional API keys needed (Open-Meteo is free, no auth)

## Setup

```bash
# Switch to feature branch
git checkout 013-weather-panel

# Install dependencies (no new packages needed for core feature)
npm install
```

No new npm packages are required. The feature uses:
- `idb` (already installed) for IndexedDB caching
- `next-intl` (already installed) for i18n
- Native `fetch` for API calls
- Native `Intl` API for locale detection
- Inline SVG for sparkline rendering

## Development

```bash
npm run dev
```

Open `http://localhost:3000`, navigate to a channel, click a conversation marker. The weather panel should appear above the message list.

## Key Files to Create

```
src/
├── components/
│   ├── weather-panel.tsx          # Main panel (summary bar + timeline)
│   ├── weather-timeline.tsx       # Expanded timeline with sparkline
│   ├── weather-sparkline.tsx      # SVG sparkline component
│   ├── weather-day-column.tsx     # Daily column in timeline
│   └── weather-hour-column.tsx    # Hourly column in timeline
├── hooks/
│   ├── use-weather.ts             # Weather data fetching + caching
│   └── use-weather-units.ts       # Unit system detection + preference
├── lib/
│   └── weather.ts                 # API client, WMO code mapping, data normalization
└── types/
    └── (extend index.ts)          # Weather interfaces
```

## Key Files to Modify

```
src/
├── components/
│   └── conversation-panel.tsx     # Insert <WeatherPanel> between header and message list
├── lib/
│   └── offline-db.ts              # Add weather + historical_averages stores (DB version bump)
└── messages/
    ├── en.json                    # Add weather.* translation keys
    ├── es.json                    # Spanish translations
    ├── fr.json                    # French translations
    └── ca.json                    # Catalan translations
```

## Testing the Feature

1. **Summary bar**: Open any conversation → weather bar should show at top
2. **Expand/collapse**: Click the summary bar → timeline should expand/collapse
3. **Auto-scroll**: Expand → timeline should center on "NOW"
4. **Offline**: Disconnect network → reload → should show cached data with staleness indicator
5. **Units**: Change browser locale or use manual override → units should switch
6. **No coordinates**: Open a conversation without coordinates (if any) → no weather panel

## API Quick Test

Test the Open-Meteo API directly:

```bash
curl "https://api.open-meteo.com/v1/forecast?latitude=45.034&longitude=6.404&past_days=4&forecast_days=4&hourly=temperature_2m,precipitation,wind_speed_10m,weather_code&current=temperature_2m,weather_code,wind_speed_10m,precipitation&timezone=auto"
```

## Translation Workflow

After adding weather strings to `en.json`:

```bash
npm run i18n              # See missing keys in es/fr/ca
# Translate manually
npm run i18n -- --sync    # Mark as current
```
