# Feature Specification: Weather Panel

**Feature Branch**: `013-weather-panel`
**Created**: 2026-03-09
**Status**: Draft
**Input**: User description: "Inline weather panel for geochat conversations showing past conditions, current weather, and forecast timeline tied to conversation location"

## Clarifications

### Session 2026-03-09

- Q: How should weather data refresh while a conversation stays open? → A: Manual refresh only — user taps a refresh button to get updated data.
- Q: What measurement units should the weather panel use? → A: Auto-detect from browser locale (metric/imperial), with manual override stored in preferences.
- Q: How should the weather panel behave when the user is offline? → A: Show last cached data with a "last updated" timestamp and visual staleness indicator.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Current Weather at Conversation Location (Priority: P1)

A user opens a geochat conversation pinned to a geographic location (e.g., Col du Lautaret trailhead). At the top of the conversation, a compact weather summary bar displays the current conditions — temperature, weather condition icon, wind speed, and precipitation — so the user can instantly assess conditions without leaving the chat.

**Why this priority**: Current weather is the single most valuable piece of information for outdoor activity planning. Every user visiting a location-based chat benefits from this at-a-glance summary.

**Independent Test**: Can be fully tested by opening any location-pinned conversation and verifying the summary bar shows live weather data. Delivers immediate situational awareness.

**Acceptance Scenarios**:

1. **Given** a conversation is pinned to a location with valid coordinates, **When** the user opens the conversation, **Then** a weather summary bar displays the current temperature, condition icon, wind speed, and precipitation amount for that location.
2. **Given** the weather summary bar is visible, **When** the user glances at it, **Then** they can read the current conditions without any interaction (no taps or clicks required).
3. **Given** the conversation location has no weather data available (e.g., coordinates in the ocean), **When** the user opens the conversation, **Then** the weather bar displays a graceful "Weather unavailable" message instead of broken or empty data.

---

### User Story 2 - Explore Weather Timeline (Priority: P1)

A user wants to understand weather trends before heading out. They expand the weather panel to reveal a horizontally scrollable timeline showing the past 4 days, today's hourly breakdown, and the 4-day forecast. The timeline auto-scrolls to center on "NOW" so the user is immediately oriented. A temperature sparkline, precipitation bars, and wind readings let them scan conditions at a glance.

**Why this priority**: The timeline transforms the panel from a simple readout into a planning tool. Users making go/no-go decisions for outdoor activities need trend context — not just the current snapshot.

**Independent Test**: Can be tested by expanding the panel and verifying the three timeline sections render with correct data, the sparkline displays, and the view auto-centers on the current time.

**Acceptance Scenarios**:

1. **Given** the weather summary bar is visible, **When** the user taps/clicks the summary bar, **Then** the timeline expands below it showing three labelled sections: past days, today (hourly), and forecast days.
2. **Given** the timeline is expanded, **When** it first renders, **Then** the view auto-scrolls horizontally to center the "NOW" column in the viewport.
3. **Given** the timeline is expanded, **When** the user scrolls horizontally, **Then** they can browse past and future columns smoothly, with past columns visually dimmed and future columns at full brightness.
4. **Given** the timeline is expanded, **When** the user taps/clicks the summary bar again, **Then** the timeline collapses and only the summary bar remains visible.

---

### User Story 3 - Assess Precipitation and Wind Patterns (Priority: P2)

A user planning a summit attempt or trail run needs to spot rain, snow, or high-wind windows. Each timeline column includes a precipitation bar (normalized to the period's maximum) and a wind speed reading. The user can visually scan for dry/calm windows across the entire timeline.

**Why this priority**: Precipitation and wind are the top safety factors for outdoor activities. Surfacing these alongside temperature completes the decision-making picture.

**Independent Test**: Can be tested by verifying each timeline column shows a precipitation bar proportional to its value and a wind speed label, and that heavy-precipitation columns are visually prominent.

**Acceptance Scenarios**:

1. **Given** the timeline is expanded, **When** the user views any column, **Then** a precipitation bar is displayed at the bottom whose height is proportional to the precipitation amount relative to the maximum across all visible periods.
2. **Given** the timeline shows a day with zero precipitation, **When** the user views that column, **Then** no precipitation bar is displayed (clean empty space).
3. **Given** the timeline is expanded, **When** the user views any column, **Then** a wind speed value is displayed with a wind icon.

---

### User Story 4 - Historical Average Reference (Priority: P3)

An experienced outdoor enthusiast wants to know whether current and forecast conditions are normal or unusual for this location and time of year. A dashed reference line on the sparkline shows the historical average temperature, providing long-term context.

**Why this priority**: Adds interpretive depth for experienced users but is not essential for basic weather awareness.

**Independent Test**: Can be tested by verifying a labelled dashed line appears on the sparkline at the historical average temperature value for the location's time of year.

**Acceptance Scenarios**:

1. **Given** the timeline sparkline is visible, **When** the user views the chart, **Then** a dashed horizontal line is drawn at the historical average temperature with a label indicating the value.
2. **Given** historical average data is unavailable for a location, **When** the timeline renders, **Then** the reference line is simply omitted (no error, no placeholder).

---

### Edge Cases

- What happens when the conversation has no geographic coordinates (e.g., a general channel)? The weather panel is not shown at all.
- What happens when the weather data provider is temporarily unavailable? The summary bar shows a "Weather temporarily unavailable" message with a retry option; any previously cached data is shown with a "last updated" timestamp.
- What happens on very narrow screens where the timeline columns would be too small to read? Minimum column widths are enforced; fewer columns are visible and the user scrolls to see the rest.
- What happens when the user's timezone differs from the conversation location's timezone? Times in the timeline are displayed in the location's local timezone with an indicator showing the timezone offset.
- What happens at the boundary between "today" and "tomorrow" (near midnight)? The "Today" section always reflects the current calendar day at the location, and the timeline updates accordingly.
- What happens when the user is offline? The weather panel shows the last cached data with a "last updated" timestamp and a visual staleness indicator. The manual refresh button is disabled with a tooltip explaining connectivity is required.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a weather summary bar at the top of any conversation that has geographic coordinates, showing current temperature, weather condition (with icon), wind speed, and precipitation.
- **FR-002**: System MUST allow the user to expand/collapse the weather timeline by tapping the summary bar, with the collapsed state as the default.
- **FR-003**: System MUST display an expanded timeline with three distinct sections: past days (default 4 days), today's hourly breakdown (2-hour intervals), and forecast days (default 4 days).
- **FR-004**: System MUST visually separate the three timeline sections with dividers and section labels ("Past N days", "Today · [date]", "Forecast").
- **FR-005**: System MUST auto-scroll the timeline to center the "NOW" column in the viewport when the panel is expanded.
- **FR-006**: System MUST render a temperature sparkline (smooth bezier curve) spanning all three timeline sections, with visual differentiation between past, present, and future segments.
- **FR-007**: System MUST display a "NOW" indicator on the timeline (highlighted column and a dot on the sparkline) to orient the user.
- **FR-008**: System MUST show precipitation bars in each timeline column, normalized to the maximum precipitation value across all visible periods.
- **FR-009**: System MUST show wind speed values in each timeline column.
- **FR-010**: System MUST visually dim past columns compared to present and future columns.
- **FR-011**: System MUST fetch weather data from an external weather data provider using the conversation's geographic coordinates when the conversation is first opened.
- **FR-012**: System MUST provide a manual refresh button that allows the user to re-fetch weather data on demand. The system MUST NOT auto-refresh weather data in the background.
- **FR-013**: System MUST auto-detect the user's preferred measurement units (metric: °C, km/h, mm; imperial: °F, mph, in) from the browser locale and display weather data accordingly.
- **FR-014**: System MUST allow the user to manually override the detected unit system, persisting the preference in local storage.
- **FR-015**: System MUST cache weather data locally so it remains available when the user is offline.
- **FR-016**: System MUST display a "last updated" timestamp and a visual staleness indicator when showing cached weather data while offline or when data is not fresh.
- **FR-017**: System MUST display a historical average temperature reference line on the sparkline when data is available.
- **FR-018**: System MUST gracefully handle missing or unavailable weather data by showing an appropriate message instead of broken UI.
- **FR-019**: System MUST NOT display the weather panel for conversations without geographic coordinates.
- **FR-020**: System MUST display times in the conversation location's local timezone.

### Key Entities

- **Weather Summary**: Current snapshot of conditions at a location — temperature, condition description, icon, wind speed, precipitation amount.
- **Timeline Column**: A single time unit (hour or day) within the weather timeline, containing temperature, condition, precipitation, and wind data.
- **Sparkline**: A continuous temperature curve rendered across all timeline columns, with visual gradient and reference markers.
- **Historical Average**: A long-term average temperature value for a location and time of year, used as a reference baseline.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can see current weather conditions for a conversation location within 2 seconds of opening the conversation.
- **SC-002**: Users can expand the full weather timeline with a single interaction (one tap or click).
- **SC-003**: The timeline auto-centers on "NOW" within 1 second of expansion, requiring zero manual scrolling to see current conditions.
- **SC-004**: Users can identify precipitation and wind patterns across a 9-day window (4 past + today + 4 future) by scrolling the timeline.
- **SC-005**: The weather panel occupies no more than 15% of the visible conversation area when collapsed.
- **SC-006**: 80% of users in outdoor-activity conversations interact with the weather panel at least once per session.
- **SC-007**: The weather panel renders correctly on screen widths from 320px to 1440px.

## Assumptions

- Conversations in geochat already have geographic coordinates (latitude/longitude) associated with them, as established in the existing data model.
- An external weather data provider (such as Open-Meteo) will be used for weather data; the specific provider is an implementation decision.
- The historical average temperature will use seasonal estimates from the weather data provider where available; if unavailable, the reference line is simply omitted.
- The "2-hour interval" for today's hourly breakdown is a default that balances information density with readability; this may be adjusted during implementation if testing reveals a better interval.
- Weather data will be cached to avoid redundant requests when multiple users view the same conversation location within a short time window.
- The weather panel does not replace or interfere with existing conversation UI (messages, input, etc.) — it sits above the message list.
