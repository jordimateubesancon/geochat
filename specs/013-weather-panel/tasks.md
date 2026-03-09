# Tasks: Weather Panel

**Input**: Design documents from `/specs/013-weather-panel/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: TypeScript interfaces, i18n keys, and IndexedDB schema extension

- [x] T001 [P] Add weather TypeScript interfaces (WeatherData, WeatherCurrent, WeatherHourly, WeatherDaySummary, WeatherUnits, UnitSystem, WeatherPreferences, CachedWeatherData, CachedHistoricalAverage) to src/types/index.ts per data-model.md
- [x] T002 [P] Add weather.* translation keys to src/messages/en.json: weather condition labels (clear, mainlyClear, partlyCloudy, overcast, fog, drizzle, rain, heavyRain, snow, heavySnow, thunderstorm), UI strings (unavailable, temporarilyUnavailable, refresh, lastUpdated, pastDays, today, forecast, now, wind, precipitation, historicalAvg, offlineTooltip, unitMetric, unitImperial), and aria labels
- [x] T003 Extend IndexedDB schema in src/lib/offline-db.ts: bump DB_VERSION to 3, add `weather` object store (key: conversationId, value: CachedWeatherData) and `historical_averages` object store (key: string "{lat},{lng},{week}", value: CachedHistoricalAverage). Add upgrade handler for version 2→3 migration.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Weather API client, WMO code mapping, unit detection — MUST complete before any UI work

- [x] T004 Create weather API client and data normalization in src/lib/weather.ts: implement `fetchWeatherData(lat, lng, unitSystem)` that calls Open-Meteo Forecast API with past_days=4, forecast_days=4, hourly and current params, timezone=auto, and unit params per research.md. Normalize the parallel-array response into WeatherData with WeatherHourly[] array. Include error handling for 400/429/5xx/network errors per contracts/weather-service.md.
- [x] T005 [P] Add WMO weather code mapping to src/lib/weather.ts: implement `getWeatherCondition(code: number)` returning `{ emoji: string, labelKey: string }` using the WMO code table from research.md (codes 0-99 → emoji + i18n key). Also implement `aggregateDaySummary(hourlyData: WeatherHourly[])` to compute WeatherDaySummary from hourly data (min/max/avg temp, total precip, max wind, dominant weather code).
- [x] T006 [P] Add weather cache helpers to src/lib/weather.ts: implement `getCachedWeather(conversationId)`, `putCachedWeather(data)`, `isCacheFresh(cachedAt, maxAgeMs = 3600000)` using the weather object store from T003. Follow existing pattern in src/lib/offline-db.ts (getDB singleton).
- [x] T007 [P] Create unit detection hook in src/hooks/use-weather-units.ts: implement `useWeatherUnits()` returning `{ units, unitSystem, setUnitSystem }` per contracts/weather-service.md. Auto-detect from navigator.language (en-US/en-LR/my → imperial, all others → metric). Store override in localStorage under key `geochat_weather_prefs`. Map unitSystem to Open-Meteo API params (celsius/fahrenheit, kmh/mph, mm/inch).

**Checkpoint**: Foundation ready — weather data can be fetched, normalized, cached, and unit preferences resolved.

---

## Phase 3: User Story 1 — View Current Weather (Priority: P1)

**Goal**: Display a compact weather summary bar at the top of conversations with location coordinates, showing current temperature, condition icon, wind speed, and precipitation.

**Independent Test**: Open any location-pinned conversation → weather summary bar appears with live data. Conversation without coordinates → no weather panel. API failure → graceful "Weather unavailable" message.

### Implementation for User Story 1

- [x] T008 [US1] Create useWeather hook in src/hooks/use-weather.ts: implement `useWeather(conversationId, latitude, longitude)` returning UseWeatherResult per contracts/weather-service.md. On mount: check IndexedDB cache → if fresh, use cached; else fetch via fetchWeatherData(). On fetch success: update state + cache. On failure + cache: serve stale + isStale=true. On failure + no cache: set error. Implement refresh() function. Check navigator.onLine for offline state. Use unitSystem from useWeatherUnits() for API params.
- [x] T009 [US1] Create WeatherPanel component in src/components/weather-panel.tsx: accepts `conversationId`, `latitude`, `longitude` props. Calls useWeather() hook. Renders summary bar showing: weather emoji icon (from getWeatherCondition), current temperature, condition label (translated via useTranslations), wind speed with icon, precipitation with icon. Include a manual refresh button (FR-012) that calls refresh(). Show loading skeleton while fetching. Show "Weather unavailable" on error (FR-018). Show staleness indicator + "last updated" timestamp when isStale (FR-016). Disable refresh button when offline with tooltip (edge case). Use Tailwind classes consistent with existing geo brand (bg-stone-50, border-stone-200, text-geo-700).
- [x] T010 [US1] Integrate WeatherPanel into conversation-panel.tsx in src/components/conversation-panel.tsx: import WeatherPanel. Render `<WeatherPanel conversationId={conversation.id} latitude={conversation.latitude} longitude={conversation.longitude} />` between the header section and the MessageList component. Only render when conversation has latitude and longitude (FR-019). Pass through i18n context.

**Checkpoint**: Weather summary bar visible in conversations with coordinates. Shows current conditions, handles errors, works offline with cached data, supports manual refresh.

---

## Phase 4: User Story 2 — Explore Weather Timeline (Priority: P1)

**Goal**: Expand the summary bar into a horizontally scrollable 9-day timeline with three sections (past days, today hourly, forecast days) and a temperature sparkline. Auto-scrolls to center on "NOW".

**Independent Test**: Click summary bar → timeline expands with 3 labeled sections. Scroll horizontally to see all columns. Past columns are dimmed. Click again → collapses. Auto-scrolls to NOW on expand.

### Implementation for User Story 2

- [x] T011 [P] [US2] Create WeatherDayColumn component in src/components/weather-day-column.tsx: accepts WeatherDaySummary + isPast boolean. Renders: day label, date, weather emoji, max/min temperature, column width fixed (e.g., 72px). Apply opacity reduction when isPast=true (FR-010). Use Tailwind for styling.
- [x] T012 [P] [US2] Create WeatherHourColumn component in src/components/weather-hour-column.tsx: accepts WeatherHourly + isNow + isPast booleans. Renders: hour label (or "NOW"), weather emoji, temperature. Highlight NOW column with accent background and border (FR-007). Apply opacity reduction when isPast (FR-010). Fixed column width (e.g., 52px).
- [x] T013 [US2] Create WeatherSparkline component in src/components/weather-sparkline.tsx: accepts array of temperature data points with column widths, nowIndex number. Renders inline SVG with: bezier curve path using cubic bezier interpolation, linear gradient shifting from muted (past) → accent (now) → muted (future), area fill beneath curve, NOW dot with pulse ring (circle markers), temperature labels on daily columns. Compute curve from data points: x = cumulative column widths, y = normalized temperature to SVG height. Use geo brand colors for gradient stops. Include ARIA label for accessibility.
- [x] T014 [US2] Create WeatherTimeline component in src/components/weather-timeline.tsx: accepts WeatherData from useWeather hook. Computes: past day summaries (aggregate hourly → WeatherDaySummary for past 4 days), today's hourly data (filter to 2-hour intervals), forecast day summaries (aggregate for future 4 days). Renders: section label row ("Past 4 days" | "Today · [date]" | "Forecast") with dividers (FR-004), WeatherSparkline spanning all sections (FR-006), row of DayColumn/HourColumn components (FR-003). Implements horizontal scroll via overflow-x-auto with hidden scrollbar. Implements auto-scroll to NOW column on mount using useRef + useEffect with scrollLeft calculation (FR-005). Include legend row at bottom.
- [x] T015 [US2] Add expand/collapse to WeatherPanel in src/components/weather-panel.tsx: add `open` state (default: false, collapsed per FR-002). Make summary bar clickable with chevron indicator. When open, render `<WeatherTimeline>` below the summary bar. Animate chevron rotation on toggle. Respect reducedMotion preference from useAccessibility for any transitions.

**Checkpoint**: Full weather timeline visible on expand. Three labeled sections, sparkline, auto-scroll to NOW, collapse/expand toggle working.

---

## Phase 5: User Story 3 — Precipitation and Wind Patterns (Priority: P2)

**Goal**: Add precipitation bars and wind speed readings to every timeline column so users can spot rain/snow/wind windows at a glance.

**Independent Test**: Expand timeline → each column shows a precipitation bar (height proportional to max) and wind speed value. Zero-precip columns have no bar.

### Implementation for User Story 3

- [x] T016 [P] [US3] Add precipitation bars to WeatherDayColumn in src/components/weather-day-column.tsx: compute bar height as `(precipitation / maxPrecipitation) * maxBarHeight`. Render a colored bar at the bottom of the column (blue tint). Show nothing when precipitation is zero (FR-008). Add wind speed label with wind emoji below the bar (FR-009).
- [x] T017 [P] [US3] Add precipitation bars to WeatherHourColumn in src/components/weather-hour-column.tsx: same normalized bar logic as DayColumn. Use accent color (amber) for NOW column bar, blue for others. Add wind speed label with wind emoji (FR-009).
- [x] T018 [US3] Compute and pass maxPrecipitation in WeatherTimeline in src/components/weather-timeline.tsx: calculate `Math.max(...allPrecipValues)` across all past, today, and forecast columns. Pass maxPrecipitation as prop to every DayColumn and HourColumn so bars are normalized consistently across the entire timeline (FR-008).

**Checkpoint**: Precipitation bars and wind values visible in every timeline column. Bar heights correctly normalized across all sections.

---

## Phase 6: User Story 4 — Historical Average Reference (Priority: P3)

**Goal**: Show a dashed horizontal reference line on the sparkline at the historical average temperature, computed from the Open-Meteo Archive API.

**Independent Test**: Expand timeline → dashed line appears at historical average with label. If archive API fails → no line, no error.

### Implementation for User Story 4

- [x] T019 [US4] Add historical average fetching to src/lib/weather.ts: implement `fetchHistoricalAverage(lat, lng)` that calls Open-Meteo Archive API for the same calendar week across the past 5 years, fetches daily temperature_2m_mean, averages all values. Return single number or null. Implement `getCachedHistoricalAvg(key)` and `putCachedHistoricalAvg(key, value)` using the historical_averages IndexedDB store. Key format: `"{lat},{lng},{weekNumber}"`. Silently return null on any error (spec: omit reference line if unavailable).
- [x] T020 [US4] Add historicalAvg to useWeather hook in src/hooks/use-weather.ts: after main weather data loads, call fetchHistoricalAverage() in a non-blocking way (do not delay summary bar or timeline rendering). Check IndexedDB cache first (never stale — seasonal data, 90-day TTL). Set historicalAvg state when resolved.
- [x] T021 [US4] Add historical reference line to WeatherSparkline in src/components/weather-sparkline.tsx: accept optional `historicalAvg: number | null` prop. When non-null, render a dashed horizontal SVG line at the y-position corresponding to the historical average temperature. Add a small text label ("hist. avg X°") at the right end of the line. Use muted color (stone-400) and strokeDasharray for dashed style. When null, render nothing (FR-017).

**Checkpoint**: Historical average reference line visible when data available. Gracefully omitted when archive API fails or data not yet loaded.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Translations, responsive design, accessibility, and final validation

- [x] T022 [P] Add Spanish translations to src/messages/es.json for all weather.* keys added in T002
- [x] T023 [P] Add French translations to src/messages/fr.json for all weather.* keys added in T002
- [x] T024 [P] Add Catalan translations to src/messages/ca.json for all weather.* keys added in T002
- [x] T025 Run `npm run i18n -- --sync` to update translation tracking in src/messages/.tracking.json
- [x] T026 Verify responsive behavior: test WeatherPanel and WeatherTimeline at 320px, 768px, and 1440px widths. Ensure minimum column widths are enforced, horizontal scroll works on mobile, and panel does not exceed 15% of conversation area when collapsed (SC-005, SC-007).
- [x] T027 Add ARIA attributes and keyboard accessibility: ensure summary bar is focusable and activatable via Enter/Space, timeline is scrollable via keyboard, refresh button has aria-label, SVG sparkline has descriptive aria-label, staleness indicator is announced by screen readers.
- [x] T028 Run `npm run lint` and fix any TypeScript/ESLint errors across all new and modified files.
- [x] T029 Run quickstart.md validation: test all 6 scenarios from specs/013-weather-panel/quickstart.md (summary bar, expand/collapse, auto-scroll, offline, units, no-coordinates).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (types) and T003 (IndexedDB) from Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion (API client, cache, units hook)
- **US2 (Phase 4)**: Depends on US1 (WeatherPanel exists to add expand/collapse to)
- **US3 (Phase 5)**: Depends on US2 (columns exist to add precip/wind to)
- **US4 (Phase 6)**: Depends on US2 (sparkline exists to add reference line to) but can run in parallel with US3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundation → can start. No other story dependencies.
- **US2 (P1)**: Requires US1 (expands the WeatherPanel created in US1).
- **US3 (P2)**: Requires US2 (enhances the columns created in US2). Can run in parallel with US4.
- **US4 (P3)**: Requires US2 (enhances the sparkline created in US2). Can run in parallel with US3.

### Within Each User Story

- Models/types before services/hooks
- Hooks before components
- Components before integration
- Core implementation before enhancement

### Parallel Opportunities

- T001, T002 can run in parallel (different files)
- T004, T005, T006, T007 can all run in parallel (different functions/files, T004 and T005 are in same file but independent exports)
- T011, T012 can run in parallel (different component files)
- T016, T017 can run in parallel (different component files)
- T022, T023, T024 can run in parallel (different translation files)
- US3 and US4 can run in parallel (different enhancement targets: columns vs. sparkline)

---

## Parallel Example: User Story 2

```bash
# Launch column components in parallel:
Task: "Create WeatherDayColumn in src/components/weather-day-column.tsx"
Task: "Create WeatherHourColumn in src/components/weather-hour-column.tsx"

# Then sequentially:
Task: "Create WeatherSparkline in src/components/weather-sparkline.tsx"
Task: "Create WeatherTimeline in src/components/weather-timeline.tsx" (depends on columns + sparkline)
Task: "Add expand/collapse to WeatherPanel" (depends on timeline)
```

## Parallel Example: Polish Phase

```bash
# Launch all translations in parallel:
Task: "Spanish translations in src/messages/es.json"
Task: "French translations in src/messages/fr.json"
Task: "Catalan translations in src/messages/ca.json"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T007)
3. Complete Phase 3: User Story 1 (T008–T010)
4. **STOP and VALIDATE**: Open a conversation → weather summary bar shows live data
5. Complete Phase 4: User Story 2 (T011–T015)
6. **STOP and VALIDATE**: Click summary → timeline expands with sparkline, auto-scrolls to NOW
7. Deploy/demo if ready — this is a fully functional weather panel

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Deploy (summary bar MVP!)
3. Add US2 → Test independently → Deploy (full timeline)
4. Add US3 → Test independently → Deploy (precip + wind)
5. Add US4 → Test independently → Deploy (historical reference)
6. Polish → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No new npm dependencies required — all built with existing packages
- The mockup file `geochat-weather-panel.tsx` at repo root serves as visual reference for styling decisions
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
