# Feature Specification: Nominatim Search & Map Toolbox

**Feature Branch**: `003-nominatim-search-toolbox`
**Created**: 2026-02-25
**Status**: Draft
**Input**: User description: "We need to implement Nominatim by OpenStreetMap and make available to the user a search box. As we are going to implement other tools I think we should render a toolbox area anywhere (feel free to suggest a place and implementation keeping in mind UX)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search for a Location by Name (Priority: P1)

A user wants to navigate to a specific place on the map (city, address, landmark, etc.) without manually panning and zooming. They open the toolbox, type a location name into the search box, see suggestions as they type, select one, and the map flies to that location.

**Why this priority**: This is the core feature requested. Without search, users must manually navigate the entire world map to find locations, which is slow and frustrating. This delivers immediate, standalone value.

**Independent Test**: Can be fully tested by typing a location name, selecting a result, and verifying the map centers on the correct coordinates.

**Acceptance Scenarios**:

1. **Given** the map is displayed, **When** the user opens the toolbox and types "Barcelona" into the search box, **Then** a list of matching location suggestions appears below the input.
2. **Given** search suggestions are displayed, **When** the user selects "Barcelona, Catalonia, Spain", **Then** the map smoothly flies to Barcelona's coordinates and zooms to an appropriate level.
3. **Given** the user is typing, **When** they have typed fewer than 3 characters, **Then** no search request is made (to avoid excessive API calls).
4. **Given** the user is typing, **When** they pause typing for a brief moment, **Then** the search is triggered automatically (debounced input).

---

### User Story 2 - Expandable Toolbox Panel (Priority: P2)

A user sees a small, unobtrusive toolbox toggle button on the left side of the map. When they click it, a toolbox panel slides open from the left, revealing available tools (starting with the search box). The panel can be collapsed back to save screen space. On mobile, the toolbox opens as a bottom sheet or overlay.

**Why this priority**: The toolbox is the container for the search feature and all future tools. It must be usable and well-positioned before additional tools can be added. It provides the foundation for extensibility.

**Independent Test**: Can be fully tested by toggling the toolbox open and closed, verifying it appears/disappears with a smooth transition, and confirming it doesn't block map interaction when collapsed.

**Acceptance Scenarios**:

1. **Given** the map is loaded, **When** the user looks at the interface, **Then** a toolbox toggle button is visible on the left side of the screen (below the top bar).
2. **Given** the toolbox is collapsed, **When** the user clicks the toggle button, **Then** the toolbox panel slides open from the left with a smooth animation.
3. **Given** the toolbox is open, **When** the user clicks the toggle button or presses Escape, **Then** the toolbox panel slides closed.
4. **Given** the toolbox is open on desktop, **When** the user interacts with the map area, **Then** the map remains fully interactive (no blocking overlay on desktop).
5. **Given** the user is on a mobile device, **When** they open the toolbox, **Then** it displays as a full-width panel from the bottom or left, with a way to dismiss it.

---

### User Story 3 - Handle No Results and Errors Gracefully (Priority: P3)

A user searches for a location that doesn't exist or the search service is temporarily unavailable. The system shows a clear, helpful message instead of failing silently or confusing the user.

**Why this priority**: Error handling ensures a polished user experience but is not needed for the core search flow to work. It completes the feature's robustness.

**Independent Test**: Can be tested by searching for nonsensical text and verifying a "no results" message appears, and by simulating a network failure to verify an error message is shown.

**Acceptance Scenarios**:

1. **Given** the user types "xyzqwerty123" in the search box, **When** the search completes, **Then** a "No results found" message is displayed.
2. **Given** the Nominatim service is unreachable, **When** the user performs a search, **Then** a user-friendly error message is shown (e.g., "Search is temporarily unavailable").
3. **Given** the user clears the search input, **When** the input is empty, **Then** the suggestion list is hidden and the search state resets.

---

### Edge Cases

- What happens when the user searches while the map is already animating (flying to a previous location)? The new search result should take priority and the map should fly to the new destination.
- What happens when the user opens the conversation panel (right side) while the toolbox (left side) is open? Both panels should coexist on desktop. On mobile, opening one should close the other.
- What happens when the Nominatim API rate-limits requests? The system should respect rate limits by debouncing user input and caching recent results within the session.
- What happens when a search result has no meaningful zoom level (e.g., an entire country)? The system should use the bounding box returned by Nominatim to set an appropriate view.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a collapsible toolbox panel on the left side of the map interface.
- **FR-002**: System MUST display a toggle button for the toolbox that is always visible when the toolbox is collapsed.
- **FR-003**: System MUST include a location search box as the first tool inside the toolbox panel.
- **FR-004**: System MUST query the Nominatim (OpenStreetMap) geocoding service when the user types a search term of 3 or more characters.
- **FR-005**: System MUST debounce search input to avoid excessive requests (minimum 300ms pause before triggering a search).
- **FR-006**: System MUST display a list of location suggestions returned by the Nominatim service.
- **FR-007**: System MUST fly the map to the selected location's coordinates when a user picks a suggestion.
- **FR-008**: System MUST use the bounding box from Nominatim results to set an appropriate zoom level for the selected location.
- **FR-009**: System MUST show a "No results found" message when a search returns zero results.
- **FR-010**: System MUST show a user-friendly error message when the search service is unavailable.
- **FR-011**: System MUST allow the toolbox to be closed by clicking the toggle button or pressing Escape.
- **FR-012**: System MUST be keyboard accessible (Tab to navigate suggestions, Enter to select, Escape to close).
- **FR-013**: System MUST be responsive — the toolbox should adapt its layout for mobile screens.
- **FR-014**: Toolbox panel MUST NOT block map interactions when collapsed.
- **FR-015**: System MUST respect Nominatim's usage policy (include a meaningful HTTP referer/user-agent, limit request frequency).
- **FR-016**: System MUST design the toolbox as an extensible container so additional tools can be added in the future without restructuring.

### Key Entities

- **Toolbox Panel**: A collapsible left-side panel that contains map tools. Can be expanded or collapsed. Persists across map interactions.
- **Search Tool**: A text input with autocomplete suggestions powered by Nominatim. Part of the toolbox.
- **Search Result**: A location suggestion returned by Nominatim, containing a display name, coordinates, and bounding box.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can search for any named location worldwide and have the map navigate there in under 3 seconds (from selection to map arrival).
- **SC-002**: Search suggestions appear within 1 second of the user pausing their typing.
- **SC-003**: The toolbox opens and closes with a smooth transition (no visual jumps or layout shifts).
- **SC-004**: The toolbox is fully usable on mobile devices with screens as small as 320px wide.
- **SC-005**: 100% of search interactions provide feedback (results, no-results message, or error message) — no silent failures.
- **SC-006**: The toolbox architecture supports adding a new tool with no changes to the existing toolbox container or search tool.

## Assumptions

- Nominatim's free public API will be used (no paid geocoding service required). The application will comply with Nominatim's usage policy (max 1 request per second, meaningful User-Agent).
- The search is forward geocoding only (name to coordinates). Reverse geocoding (coordinates to name) is out of scope.
- Search results are not persisted — they exist only during the active session.
- The toolbox will initially contain only the search tool. Future tools (e.g., measurement, drawing, layer switcher) will be added in separate features.
- The toolbox toggle button uses an icon (e.g., a search/magnifying glass or wrench icon) rather than text to save space.

## Out of Scope

- Reverse geocoding (clicking the map to get an address).
- Search history or saved/favorite locations.
- Custom geocoding providers or provider switching.
- Tools other than search (measurement, drawing, etc.) — these are planned for future features.
