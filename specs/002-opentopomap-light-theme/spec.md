# Feature Specification: OpenTopoMap Layer & Light Theme

**Feature Branch**: `002-opentopomap-light-theme`
**Created**: 2026-02-24
**Status**: Draft
**Input**: User description: "Add OpenTopoMap as the map layer and use Dark Mode only if strictly necessary"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch to OpenTopoMap Tiles (Priority: P1)

A user opens the GeoChat app and sees the map rendered with OpenTopoMap tiles instead of the current CARTO Dark Matter tiles. OpenTopoMap displays topographic features (contour lines, elevation shading, hiking trails, peaks) which provide richer geographic context for location-based conversations.

**Why this priority**: This is the core change — replacing the map tile layer. Without this, no other changes matter.

**Independent Test**: Open the app. The map displays OpenTopoMap tiles showing topographic features (contour lines, elevation, terrain coloring). Pan and zoom to verify tiles load correctly at all zoom levels. Conversation markers remain visible and readable on top of the new tiles.

**Acceptance Scenarios**:

1. **Given** a user opens the app, **When** the map loads, **Then** OpenTopoMap tiles are displayed showing topographic features
2. **Given** a user pans or zooms the map, **When** new tiles are needed, **Then** OpenTopoMap tiles load without errors at all zoom levels
3. **Given** conversations exist on the map, **When** markers are displayed on OpenTopoMap, **Then** markers and their popups/tooltips are clearly readable against the topographic background

---

### User Story 2 - Light Theme for UI Chrome (Priority: P1)

Since OpenTopoMap uses a light, colorful visual style, the surrounding UI elements (top bar, conversation panel, create dialog, nearby warning, toasts, message bubbles) should switch from a dark theme to a light theme so the overall look is visually cohesive. Dark mode should only be retained if there is a specific UI element that is strictly more readable in dark.

**Why this priority**: A dark UI surrounding a bright, colorful map creates visual dissonance. The theme must match the map for a polished experience.

**Independent Test**: Open the app. The top bar, conversation panel, dialogs, and toasts all use light backgrounds with dark text. The visual style is cohesive with the OpenTopoMap tiles. All text remains readable with sufficient contrast.

**Acceptance Scenarios**:

1. **Given** a user opens the app, **When** viewing the top bar, **Then** it uses a light/semi-transparent background with dark text
2. **Given** a user opens a conversation panel, **When** viewing messages, **Then** the panel has a light background, own messages are visually distinct from others, and all text meets contrast requirements
3. **Given** a user opens the create dialog or nearby warning, **When** viewing the modal, **Then** it uses light theme styling consistent with the rest of the UI
4. **Given** a toast notification appears, **When** the user reads it, **Then** it is styled with light theme colors and remains readable

---

### Edge Cases

- What happens when OpenTopoMap tile servers are slow or unavailable? The map should show a fallback background color while tiles load, and not break the app.
- What happens with markers on areas of the map with dense topographic detail (many contour lines, labels)? Markers must remain distinguishable.
- What happens with the existing dark-themed Leaflet default controls (zoom buttons, attribution)? They should be styled or left as-is if already readable on the light map.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the map using OpenTopoMap tile layer (`https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`) with proper attribution ("Map data: OpenStreetMap contributors, SRTM | Map style: OpenTopoMap (CC-BY-SA)")
- **FR-002**: System MUST remove the CARTO Dark Matter tile layer entirely
- **FR-003**: The root layout MUST switch from dark theme (`bg-neutral-900 text-neutral-100`) to a light theme (`bg-white text-neutral-900` or equivalent)
- **FR-004**: The `dark` class MUST be removed from the `<html>` element
- **FR-005**: The top bar MUST use a light semi-transparent background so the map remains visible behind it
- **FR-006**: The conversation panel MUST use a light background with dark text for all content (header, messages, input)
- **FR-007**: Own-message bubbles MUST remain visually distinct from other users' messages using color differentiation that works on a light background
- **FR-008**: The create dialog and nearby warning modals MUST use light theme styling with sufficient contrast
- **FR-009**: Toast notifications MUST use light-themed colors (error toasts remain visually distinct from info toasts)
- **FR-010**: All text across the application MUST meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text) against their light backgrounds
- **FR-011**: The Tailwind `darkMode` configuration MAY be removed or kept, but no UI element should depend on the `dark` class for its primary styling
- **FR-012**: The map loading placeholder (shown while Leaflet initializes) MUST use a light neutral background instead of the current dark one
- **FR-013**: All existing functionality (create conversations, send messages, realtime updates, anonymous identity, responsive layout) MUST continue to work unchanged

### Assumptions

- OpenTopoMap tile servers are publicly available and free for moderate usage (standard OSM tile usage policy applies)
- No user preference toggle for dark/light mode is needed — the app is light-only after this change
- Leaflet's default zoom controls are acceptable as-is on the light map (they are already light-themed by default)
- Message bubble colors will be adjusted to work on light backgrounds (e.g., blue for own messages remains, neutral light gray for others)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The map displays OpenTopoMap tiles at all zoom levels (1-17) without rendering errors
- **SC-002**: All UI text meets WCAG AA contrast ratio (4.5:1) against light backgrounds
- **SC-003**: Users can distinguish their own messages from others' messages at a glance in the conversation panel
- **SC-004**: All existing features (create, join, chat, realtime sync) continue to pass their original acceptance tests
- **SC-005**: The visual transition between map tiles and UI chrome feels cohesive — no jarring dark/light boundary
