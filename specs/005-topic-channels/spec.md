# Feature Specification: Topic Channels

**Feature Branch**: `005-topic-channels`
**Created**: 2026-02-25
**Status**: Draft
**Input**: User description: "Allow users to select a topic/channel before accessing the map, grouping chats by outdoor activity topics like Skimo, Rock climbing, etc."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Select a Channel (Priority: P1)

When a user opens the application, they are presented with a channel selection screen before seeing the map. The screen displays all available channels (e.g., "Skimo", "Rock Climbing", "Trail Running"). The user taps on a channel to enter it and is then shown the map with only the conversations belonging to that channel.

**Why this priority**: This is the core feature — without channel selection, no other channel functionality matters. It gates access to the map and establishes the fundamental user flow.

**Independent Test**: Can be fully tested by opening the app, seeing the channel list, selecting "Skimo", and verifying that only Skimo-related conversations appear on the map.

**Acceptance Scenarios**:

1. **Given** the user opens the application, **When** the app loads, **Then** the user sees a channel selection screen listing all available channels
2. **Given** the user is on the channel selection screen, **When** they select "Skimo", **Then** the map loads showing only conversations belonging to the "Skimo" channel
3. **Given** the user is on the channel selection screen, **When** channels are loading, **Then** a loading indicator is displayed

---

### User Story 2 - Switch Between Channels (Priority: P2)

While viewing the map within a channel, the user can navigate back to the channel selection screen to choose a different channel. This allows users to move between topics without restarting the application.

**Why this priority**: Once users can enter a channel, they need the ability to switch between channels to explore different topics during a single session.

**Independent Test**: Can be tested by entering "Skimo", then navigating back and selecting "Rock Climbing", and verifying the map updates to show only Rock Climbing conversations.

**Acceptance Scenarios**:

1. **Given** the user is viewing the map in the "Skimo" channel, **When** they tap the channel name or a back/switch button, **Then** they return to the channel selection screen
2. **Given** the user switches from "Skimo" to "Rock Climbing", **When** the map reloads, **Then** only "Rock Climbing" conversations are visible on the map
3. **Given** the user switches channels, **When** they had an unsaved message draft in the previous channel, **Then** the draft is discarded (no cross-channel draft persistence)

---

### User Story 3 - Create a New Conversation Within a Channel (Priority: P2)

When a user creates a new conversation (chat) on the map, it is automatically associated with the currently active channel. The user does not need to manually assign a channel — it is inherited from context.

**Why this priority**: Conversations must belong to channels for the grouping to work. This ensures all new content is properly categorized.

**Independent Test**: Can be tested by entering the "Skimo" channel, creating a new conversation on the map, and verifying it appears only when viewing the "Skimo" channel.

**Acceptance Scenarios**:

1. **Given** the user is in the "Skimo" channel, **When** they create a new conversation, **Then** the conversation is automatically tagged with "Skimo"
2. **Given** a conversation was created in "Skimo", **When** another user views the "Rock Climbing" channel, **Then** the "Skimo" conversation does not appear

---

### User Story 4 - View Channel Information (Priority: P3)

Each channel displays basic information such as its name, a short description, and the number of active conversations. This helps users decide which channel to enter.

**Why this priority**: Enhances discoverability and helps users make informed choices, but the app is functional without it.

**Independent Test**: Can be tested by viewing the channel list and verifying each channel shows a name, description, and conversation count.

**Acceptance Scenarios**:

1. **Given** the user is on the channel selection screen, **When** channels are displayed, **Then** each channel shows its name, description, and number of active conversations
2. **Given** a channel has zero conversations, **When** the user views the channel list, **Then** the channel still appears with a count of 0

---

### Edge Cases

- What happens when there are no channels available? The user sees an empty state message indicating no channels exist yet.
- What happens if a channel is deleted while a user is viewing it? The user is redirected to the channel selection screen with a notification.
- What happens when a user has no internet connection while on the channel selection screen? A cached version of the channel list is shown if available; otherwise, an offline error message appears.
- How does the system handle a channel with thousands of conversations? Only conversations within the visible map area are loaded, consistent with existing map behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a channel selection screen as the first screen after app launch (before the map)
- **FR-002**: System MUST list all available channels with their name, description, and active conversation count
- **FR-003**: Users MUST be able to select a channel to enter the map view filtered to that channel
- **FR-004**: System MUST filter map conversations to show only those belonging to the selected channel
- **FR-005**: Users MUST be able to navigate back from the map to the channel selection screen to switch channels
- **FR-006**: System MUST automatically associate new conversations with the currently active channel
- **FR-007**: System MUST display a clear indicator of the currently active channel while on the map
- **FR-008**: System MUST support a predefined list of channels managed exclusively by administrators — users can only browse and select channels, not create or modify them
- **FR-009**: System MUST persist channel data so channels and their associations survive across sessions
- **FR-010**: System MUST handle the case where a user accesses a direct link to a conversation — the app should load the appropriate channel context automatically

### Key Entities

- **Channel**: Represents a topic grouping for conversations. Key attributes: name, description, icon/image, creation date, active status. A channel contains zero or more conversations.
- **Conversation (updated)**: An existing entity that now belongs to exactly one channel. The relationship is mandatory — every conversation must be associated with a channel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse and select a channel in under 5 seconds from app launch
- **SC-002**: 100% of new conversations are automatically assigned to the active channel without manual user action
- **SC-003**: Switching between channels completes (map fully updated) in under 3 seconds
- **SC-004**: Channel selection screen displays correctly with up to 50 channels
- **SC-005**: Users can identify and select the desired channel on their first attempt at least 90% of the time (measured by no immediate back-navigation after channel selection)

## Assumptions

- Channels are predefined and curated by administrators only — users cannot create, edit, or delete channels
- The existing conversation creation flow remains unchanged except for the automatic channel association
- Channel list is relatively small (under 50 items) and does not require search or pagination in the initial version
- All users see the same set of channels (no per-user channel visibility or permissions in this version)
- The channel selection screen replaces the current app entry point (map is no longer the first screen)
- Outdoor activities are the primary use case for channels (e.g., Skimo, Rock Climbing, Trail Running, Hiking, Mountain Biking)
