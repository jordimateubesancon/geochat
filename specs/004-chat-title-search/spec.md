# Feature Specification: Chat Title Search with Dual Search Mode

**Feature Branch**: `004-chat-title-search`
**Created**: 2026-02-25
**Status**: Draft
**Input**: User description: "We need to allow users to search not only by place (Nominatim) but also by chat title. We must find a way to make intuitive the two toggle between the two possibilities (Nominatim or Title)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Conversations by Title (Priority: P1)

A user wants to find a specific conversation they remember by name. They open the toolbox, switch the search mode to "Chats", type part of a conversation title, and see matching conversations listed. When they select one, the map flies to that conversation's location and opens its panel.

**Why this priority**: This is the core new capability. The place search already exists — adding chat title search is the primary user need.

**Independent Test**: Can be fully tested by switching to "Chats" mode, typing a conversation title, selecting a result, and verifying the map navigates to the conversation and the conversation panel opens.

**Acceptance Scenarios**:

1. **Given** the toolbox is open, **When** the user switches to "Chats" mode and types "park" into the search box, **Then** a list of conversations whose titles contain "park" (case-insensitive) appears.
2. **Given** chat search results are displayed, **When** the user selects a conversation, **Then** the map flies to the conversation's coordinates and the conversation panel opens.
3. **Given** the user types a query that matches no conversation titles, **When** the search completes, **Then** a "No conversations found" message is displayed.
4. **Given** the user is in "Chats" mode, **When** they type fewer than 2 characters, **Then** no search is performed.

---

### User Story 2 - Intuitive Toggle Between Search Modes (Priority: P2)

A user sees a clear, simple control to switch between "Places" and "Chats" search modes. The toggle is immediately understandable without instructions. The currently active mode is visually highlighted. The search input placeholder text updates to reflect the selected mode.

**Why this priority**: The toggle is what makes both search modes discoverable and usable. Without an intuitive toggle, users may not realize chat search exists.

**Independent Test**: Can be fully tested by verifying the toggle renders with two clearly labeled options, switching between them updates the placeholder and search behavior, and the active mode is visually distinct.

**Acceptance Scenarios**:

1. **Given** the toolbox is open, **When** the user looks at the search area, **Then** they see a segmented control (pill toggle) with two options: "Places" and "Chats".
2. **Given** "Places" mode is active (default), **When** the user clicks "Chats", **Then** the toggle highlights "Chats", the input placeholder changes to "Search conversations...", and any previous results are cleared.
3. **Given** "Chats" mode is active, **When** the user clicks "Places", **Then** the toggle highlights "Places", the input placeholder changes to "City, address, or place...", and any previous results are cleared.
4. **Given** the user switches modes, **When** there is text in the search box, **Then** the text is preserved but results are cleared and a new search is triggered in the new mode.

---

### User Story 3 - Unified Search Experience (Priority: P3)

Both search modes share the same input field, results list, keyboard navigation, loading indicator, and error handling. The user experience is consistent regardless of which mode is active — only the data source and result format differ.

**Why this priority**: Consistency reduces cognitive load. A unified experience means users learn one interaction pattern for both modes.

**Independent Test**: Can be tested by verifying keyboard navigation (arrows, Enter, Escape), loading spinner, and error messages work identically in both modes.

**Acceptance Scenarios**:

1. **Given** the user is in "Chats" mode, **When** they use arrow keys and Enter, **Then** they can navigate and select results using the same keyboard shortcuts as "Places" mode.
2. **Given** the chat search service is unavailable, **When** the user performs a search, **Then** an error message is displayed in the same style as the place search error.
3. **Given** results are shown in either mode, **When** the user presses Escape, **Then** the results are cleared and the input is blurred.

---

### Edge Cases

- What happens when a conversation is deleted while search results are displayed? The search result should still appear, but selecting it should handle the missing conversation gracefully (e.g., show a toast saying "Conversation no longer exists").
- What happens when there are many matching conversations (e.g., 50+)? Results should be limited to a reasonable number (e.g., 10) to keep the list manageable.
- What happens if the user rapidly toggles between modes while typing? The system should cancel any in-flight requests from the previous mode and start fresh.
- What happens when the user searches for chats while viewing a very different part of the map? The search should find conversations regardless of the current map viewport — it's a global search by title.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide two search modes: "Places" (Nominatim geocoding) and "Chats" (conversation title search).
- **FR-002**: System MUST display a segmented toggle control (pill-style) above the search input with "Places" and "Chats" labels.
- **FR-003**: System MUST default to "Places" mode when the toolbox opens.
- **FR-004**: System MUST visually highlight the active search mode in the toggle.
- **FR-005**: System MUST update the search input placeholder text based on the active mode ("City, address, or place..." for Places, "Search conversations..." for Chats).
- **FR-006**: System MUST search conversation titles using case-insensitive partial matching when in "Chats" mode.
- **FR-007**: System MUST search across all conversations globally, not limited to the current map viewport.
- **FR-008**: System MUST display conversation results showing the conversation title and creator name.
- **FR-009**: When a conversation result is selected, the system MUST fly the map to the conversation's coordinates and open its conversation panel.
- **FR-010**: System MUST limit chat search results to 10 items.
- **FR-011**: System MUST clear results when the user switches search modes.
- **FR-012**: System MUST debounce chat search input (minimum 300ms).
- **FR-013**: System MUST require a minimum of 2 characters before performing a chat title search.
- **FR-014**: System MUST show "No conversations found" when chat search returns zero results.
- **FR-015**: System MUST show an error message when the chat search fails.
- **FR-016**: System MUST preserve keyboard accessibility (arrow keys, Enter, Escape) in both modes.

### Key Entities

- **Search Mode**: An enumeration of "places" or "chats" representing the active search type.
- **Chat Search Result**: A conversation matching the search query, containing title, creator name, and geographic coordinates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find a conversation by title and navigate to it in under 5 seconds (type query, select result, map arrives).
- **SC-002**: Chat search results appear within 1 second of the user pausing their typing.
- **SC-003**: The toggle between search modes is understandable without instructions — users can switch modes on first attempt.
- **SC-004**: Both search modes share identical keyboard navigation and feedback patterns (loading, no results, errors).
- **SC-005**: Switching search modes clears results and updates the UI instantly (no visible delay).

## Assumptions

- Chat title search queries the existing conversations data source (Supabase) — no new external service is needed.
- The search is global (not viewport-limited) to allow finding conversations anywhere on the map.
- The segmented toggle (pill control) is a well-established UI pattern that users understand intuitively — no tooltip or onboarding is required.
- "Places" mode remains the default because location search was the original and most common use case.
- The minimum character threshold for chat search is 2 (lower than Nominatim's 3) because conversation titles are shorter and more specific.

## Out of Scope

- Full-text search within conversation messages (only titles are searched).
- Search ranking or relevance scoring — results are returned in creation order.
- Saved searches or search history.
- Combined/unified search across both modes simultaneously.
