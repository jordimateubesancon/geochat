# Implementation Plan: Weather Panel

**Branch**: `013-weather-panel` | **Date**: 2026-03-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-weather-panel/spec.md`

## Summary

Add an inline weather panel to geochat conversation views that shows current conditions (summary bar) and an expandable 9-day timeline (4 past + today hourly + 4 forecast). Weather data is fetched from the Open-Meteo API (free, no API key), cached in IndexedDB for offline access, and rendered with an SVG sparkline. Units auto-detect from browser locale with manual override.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any` types) + Next.js 14 (App Router), React 18+
**Primary Dependencies**: react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js 2.97, next-intl 4.8, idb 8.x (all existing — no new dependencies)
**Storage**: IndexedDB (client-side weather cache via `idb`), localStorage (unit preferences). No Supabase/PostgreSQL changes.
**Testing**: `npm test && npm run lint` (existing)
**Target Platform**: Web (responsive, 320px–1440px), PWA-capable
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Weather data visible within 2 seconds of conversation open (SC-001); timeline renders and auto-scrolls within 1 second of expansion (SC-003)
**Constraints**: Zero-budget (free API only), offline-capable, no new npm dependencies
**Scale/Scope**: ~7 new files, ~3 modified files, 1 IndexedDB version bump

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero-Budget, Zero-Friction | ✅ Pass | Open-Meteo is free, no API key. No new paid services. |
| II. Open Source First | ✅ Pass | Open-Meteo is open-source. No new proprietary dependencies. |
| III. Ship the Simplest Thing | ✅ Pass | Single API call, inline SVG sparkline, no charting library. No new npm packages. |
| IV. Real-Time Is Core | ✅ Pass | Weather is not real-time data. Manual refresh is appropriate (clarification session confirmed). Does not interfere with existing realtime messaging. |
| V. Location Is First-Class | ✅ Pass | Weather is fetched using conversation's existing lat/lng coordinates. Reinforces geospatial value of every conversation. |
| VI. Anonymous by Default | ✅ Pass | No user identity involved. Unit preferences stored in localStorage (anonymous). |
| VII. Map Is the Interface | ✅ Pass | Weather panel lives inside the conversation panel (opened from map markers). Does not compete with the map for attention. |

**Post-Phase 1 re-check**: All gates still pass. No database changes, no new dependencies, no paid services.

## Project Structure

### Documentation (this feature)

```text
specs/013-weather-panel/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: API research, decisions
├── data-model.md        # Phase 1: TypeScript interfaces, IndexedDB schema
├── quickstart.md        # Phase 1: Dev setup and testing guide
├── contracts/
│   └── weather-service.md  # Phase 1: API and hook contracts
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── weather-panel.tsx          # NEW: Main panel (summary bar + expand/collapse)
│   ├── weather-timeline.tsx       # NEW: Scrollable timeline container
│   ├── weather-sparkline.tsx      # NEW: SVG bezier sparkline with gradient
│   ├── weather-day-column.tsx     # NEW: Daily column (past/forecast)
│   ├── weather-hour-column.tsx    # NEW: Hourly column (today)
│   └── conversation-panel.tsx     # MODIFY: Insert <WeatherPanel> between header and messages
├── hooks/
│   ├── use-weather.ts             # NEW: Fetch, cache, refresh weather data
│   └── use-weather-units.ts       # NEW: Unit detection + preference management
├── lib/
│   ├── weather.ts                 # NEW: API client, WMO mapping, data normalization
│   └── offline-db.ts              # MODIFY: Add weather + historical_averages stores (v3)
├── types/
│   └── index.ts                   # MODIFY: Add weather interfaces
└── messages/
    ├── en.json                    # MODIFY: Add weather.* keys
    ├── es.json                    # MODIFY: Add weather.* translations
    ├── fr.json                    # MODIFY: Add weather.* translations
    └── ca.json                    # MODIFY: Add weather.* translations
```

**Structure Decision**: Follows existing single-project structure. Weather components are colocated in `src/components/` (consistent with existing `conversation-panel.tsx`, `message-list.tsx`). Weather logic split into a service (`lib/weather.ts`) and hooks (`hooks/use-weather.ts`) — same pattern as existing `lib/supabase.ts` + `hooks/use-messages.ts`.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
