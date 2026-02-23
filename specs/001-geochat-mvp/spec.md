# Feature Specification: GeoChat MVP

**Feature Branch**: `001-geochat-mvp`
**Created**: 2026-02-23
**Status**: Draft
**Input**: Location-based conversation platform where discussions are anchored to real-world coordinates. Users discover and join conversations by exploring an interactive map.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover Conversations on the Map (Priority: P1)

A user opens GeoChat and sees a full-screen interactive map. Conversation markers are scattered across the map at their real-world coordinates. Each marker gives a visual indication of activity (e.g., message count). The user pans and zooms to explore different areas and discover what people are talking about in various locations. As other users create new conversations elsewhere, new markers appear on the map automatically — no refresh needed.

**Why this priority**: Without the ability to see and explore conversations spatially, the product has no value. The map-as-interface is the core concept being validated. This story alone delivers the "browse and discover" experience that defines GeoChat.

**Independent Test**: Open the app in a browser. Verify the map loads full-screen with conversation markers visible. Pan and zoom to confirm markers correspond to geographic locations. Have a second user create a conversation and confirm the marker appears on the first user's map within 2 seconds.

**Acceptance Scenarios**:

1. **Given** the app is opened for the first time, **When** the page loads, **Then** a full-screen interactive map is displayed with existing conversation markers visible.
2. **Given** a user is viewing the map, **When** they pan and zoom, **Then** conversation markers in the new viewport area become visible.
3. **Given** two users have the app open, **When** User A creates a conversation, **Then** User B sees the new marker appear on their map within 2 seconds without refreshing.
4. **Given** a conversation marker is visible, **When** the user looks at it, **Then** they can see the total message count and a relative timestamp of the last message sent.

---

### User Story 2 - Start a Conversation at a Location (Priority: P1)

A user clicks on any point on the map to start a new conversation. A dialog appears asking for a topic/title and a first message, and shows the selected coordinates for awareness. After submitting, a marker appears on the map and the conversation panel opens so the user can continue. Other users see the new marker appear on their maps in real-time.

**Why this priority**: Creating conversations is equally essential as discovering them — without content creation, there is nothing to discover. This is co-priority P1 with Story 1 because together they form the minimum viable loop.

**Independent Test**: Click an empty area of the map. Fill in a title (max 120 characters) and first message (max 2000 characters). Submit and verify the marker appears and the conversation panel opens. In a second browser, verify the marker appears automatically.

**Acceptance Scenarios**:

1. **Given** a user is viewing the map, **When** they click on an empty area, **Then** a creation dialog appears showing the selected coordinates, a title field, and a message field.
2. **Given** the creation dialog is open, **When** the user submits a title and first message, **Then** a new conversation marker appears on the map and the conversation panel opens.
3. **Given** the creation dialog is open, **When** the user leaves the title or message empty and tries to submit, **Then** the form prevents submission and indicates the missing fields.
4. **Given** the creation dialog is open, **When** the user clicks Cancel or presses Escape, **Then** the dialog closes and no conversation is created.
5. **Given** the creation dialog is open, **When** the user enters a title longer than 120 characters or a message longer than 2000 characters, **Then** the input is constrained and the user is informed of the limit.
6. **Given** a user clicks a point on the map within 1 km of an existing conversation, **When** the creation dialog would normally appear, **Then** the system first shows a warning listing nearby conversations and offers the user the choice to join one of them instead.
7. **Given** the nearby conversation warning is shown, **When** the user chooses to proceed with creation anyway, **Then** the normal creation dialog appears and the conversation is created at the selected coordinates.

---

### User Story 3 - Join and Participate in a Conversation (Priority: P1)

A user clicks on a conversation marker to open a side panel showing the conversation title, location, and all messages in chronological order. They can read the full history and send new messages. Sent messages appear immediately (before server confirmation). New messages from other participants appear in real-time without refreshing.

**Why this priority**: The ability to read and contribute to conversations completes the core interaction loop. Without this, conversations are write-only. This is co-priority P1 because discover + create + participate together form the minimum viable product.

**Independent Test**: Click a conversation marker. Verify the panel shows title, location, and message history. Send a message and verify it appears instantly. Open the same conversation in a second browser and verify messages sync both ways within 2 seconds.

**Acceptance Scenarios**:

1. **Given** a user clicks a conversation marker, **When** the panel opens, **Then** it displays the conversation title, coordinates, creator name, creation time, and all messages in chronological order.
2. **Given** a user is viewing a conversation, **When** they type a message and press Send (or Enter), **Then** the message appears immediately in their message list.
3. **Given** a user sent a message optimistically, **When** the server confirms the write, **Then** the message remains in the list. **When** the server rejects the write, **Then** the message is removed and an error notification is shown.
4. **Given** two users are viewing the same conversation, **When** User A sends a message, **Then** User B sees it appear within 2 seconds without refreshing.
5. **Given** a user is viewing a conversation panel, **When** they click the close button or click outside the panel, **Then** the panel closes and the full map view is restored.
6. **Given** a user is viewing a conversation, **When** they look at each message, **Then** they can see the author's display name, message body, and relative timestamp, with their own messages visually distinguished from others'.

---

### User Story 4 - Anonymous Participation (Priority: P2)

When a user opens GeoChat, they are automatically assigned a randomly generated display name. There is no sign-up, login, or account creation. The user can immediately start creating and joining conversations. Their display name is shown in the top bar and on all messages they send.

**Why this priority**: Zero-friction participation is a core principle, but the identity system is secondary to the spatial conversation mechanics. The app works with placeholder names while P1 stories are being built; this story formalizes the anonymous identity experience.

**Independent Test**: Open the app and verify a display name is assigned and visible in the top bar. Send a message and verify the display name appears on it. Open the app in a different browser and verify a different display name is assigned.

**Acceptance Scenarios**:

1. **Given** a user opens the app for the first time, **When** the page loads, **Then** a random display name is generated and shown in the top bar.
2. **Given** a user has a display name, **When** they create a conversation or send a message, **Then** their display name is associated with that content.
3. **Given** two different users open the app, **When** they compare display names, **Then** the names are different.

---

### User Story 5 - Responsive Mobile Experience (Priority: P3)

A user accesses GeoChat from a mobile browser on a device as narrow as 375px. The map remains the primary interface. When opening a conversation, the panel takes the full screen width instead of appearing as a side panel. The creation dialog adapts to the smaller screen without requiring horizontal scrolling.

**Why this priority**: The app must be usable on mobile, but the core experience is validated on desktop first. Mobile responsiveness is important but not blocking for concept validation.

**Independent Test**: Open the app on a mobile browser (or resize to 375px). Verify the map is usable, the creation dialog fits the screen, and the conversation panel occupies full width.

**Acceptance Scenarios**:

1. **Given** a user opens the app on a screen narrower than 768px, **When** they click a conversation marker, **Then** the conversation panel takes the full screen width.
2. **Given** a user opens the creation dialog on a mobile screen, **When** the dialog appears, **Then** all fields are visible and usable without horizontal scrolling.
3. **Given** a user is on a mobile device, **When** they interact with the map, **Then** touch gestures (pinch-to-zoom, drag-to-pan) work as expected.

---

### Edge Cases

- What happens when a user creates a conversation at the exact same coordinates or within 1 km of an existing one? The system MUST warn the user that nearby conversations exist and present them with the option to join an existing conversation instead. The user may still choose to create a new conversation after seeing the warning.
- What happens when the user's network connection drops while viewing a conversation? Messages already loaded remain visible. New messages stop appearing. When the connection is restored, the system reconnects automatically and catches up.
- What happens when a user sends a message but the server is unreachable? The optimistic message is removed after a timeout and a non-intrusive error notification is shown.
- What happens when there are no conversations on the map at all? A subtle hint tells the user they can click the map to start a conversation.
- What happens when a conversation has hundreds of messages? The most recent messages are loaded first. Older messages are fetched progressively as the user scrolls up.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST display an interactive map as the full-screen primary interface.
- **FR-002**: Conversations MUST be represented as markers on the map at their geographic coordinates. Markers MUST be loaded for the visible map viewport and refetched when the user pans or zooms.
- **FR-003**: Markers MUST visually communicate conversation activity level by displaying the total message count and a relative timestamp of the last message (e.g., "12 messages · 5 min ago").
- **FR-004**: Users MUST be able to create a conversation by clicking any point on the map.
- **FR-005**: Conversation creation MUST require a title (max 120 characters) and a first message (max 2000 characters).
- **FR-005a**: When a user attempts to create a conversation at coordinates within 1 km of one or more existing conversations, the system MUST display a warning showing those nearby conversations and offer the user the option to join one instead. The user MUST still be able to proceed with creating a new conversation after acknowledging the warning.
- **FR-006**: Users MUST be able to open a conversation by clicking its marker, revealing a side panel with title, location, messages, and an input area.
- **FR-007**: Messages MUST appear in chronological order with author name, body, and relative timestamp. The most recent messages MUST be loaded first; older messages MUST be fetched progressively as the user scrolls up.
- **FR-008**: A user's own messages MUST be visually distinguished from other users' messages.
- **FR-009**: Sending a message MUST use optimistic updates — the message appears instantly before server confirmation.
- **FR-010**: If an optimistic write fails, the message MUST be removed and a non-intrusive error notification MUST be shown.
- **FR-011**: New conversations created by any user MUST appear on all other users' maps within 2 seconds.
- **FR-012**: New messages in a conversation MUST appear for all viewers of that conversation within 2 seconds.
- **FR-013**: When a conversation receives a new message, its marker MUST reflect updated activity for all users.
- **FR-014**: Users MUST be assigned a randomly generated display name upon first visit, with no sign-up required.
- **FR-015**: The top bar MUST show the app name/logo and the user's display name.
- **FR-016**: When no conversations exist and no panels are open, the app MUST display a hint telling the user they can click the map to start a conversation.
- **FR-017**: The conversation panel MUST have a close button. Clicking outside the panel MUST also close it.
- **FR-018**: The creation dialog MUST support keyboard submission (Enter in message field submits the form).
- **FR-019**: The message input MUST support Shift+Enter for new lines.

### Accessibility Requirements

- **AR-001**: The map MUST be keyboard-navigable.
- **AR-002**: Opening a modal or panel MUST trap focus; closing MUST return focus to the trigger element.
- **AR-003**: All interactive elements MUST have appropriate ARIA labels.
- **AR-004**: All text MUST meet sufficient color contrast standards in the dark theme.

### Key Entities

- **Conversation**: A discussion anchored to a specific geographic point. Has a title, a location (latitude/longitude), a creator, a creation timestamp, and a collection of messages.
- **Message**: A single contribution to a conversation. Has an author (display name), a text body (max 2000 characters), and a creation timestamp. Belongs to exactly one conversation.
- **User Session**: An anonymous participant identified by a randomly generated display name persisted in browser storage. Has no persistent account. The same name is reused on return until storage is cleared.

## Assumptions

- Conversations do not expire in V1. All conversations persist indefinitely.
- There is no limit on the number of conversations or messages.
- Display names are generated randomly on first visit and persisted in browser storage. The same name is used on return until storage is cleared. Names are not guaranteed to be unique (collisions are acceptable at V1 scale).
- On first load, the app prompts the user to allow geolocation. If granted, the map centers on the user's current position. If denied or unavailable, the map falls back to a world-level zoomed-out view.
- Dark theme is the only visual theme in V1.
- Message ordering is by creation time only; there is no threading or nesting.

## Scope Exclusions

Per the constitution, V1 explicitly excludes:

- User authentication or persistent accounts
- Editing or deleting conversations and messages
- Content moderation, flagging, or reporting
- Image, video, or file attachments
- Conversation categories, tags, or filtering
- Search by keyword
- Push notifications
- Offline support
- Direct messaging between users
- Admin dashboard
- Analytics or usage tracking
- Geofencing or location-gated access
- Native mobile apps

## Clarifications

### Session 2026-02-23

- Q: What happens when a user creates a conversation at the exact same coordinates or nearby an existing one? → A: The system MUST warn the user if there is a conversation at the exact same coordinates or within a 1 km radius, present nearby conversations, and offer the user the option to join one. The user may still proceed to create a new conversation.
- Q: What does "activity level" mean on conversation markers? → A: Markers display the total message count and a relative timestamp of the last message (e.g., "12 messages · 5 min ago").
- Q: Does the display name persist if the user closes and reopens the browser? → A: Yes. The name is persisted in browser storage and reused on return until storage is cleared.
- Q: What should the map show on first load when no geolocation is available? → A: Prompt the user to allow geolocation; center on their position if granted, fall back to a world-level zoomed-out view if denied or unavailable.
- Q: How should the message list handle conversations with very long histories? → A: Load most recent messages first; fetch older messages progressively when user scrolls up.
- Q: Should conversation markers be loaded only for the visible map area, or all at once? → A: Load markers for the visible map viewport; refetch when the user pans or zooms.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can open the app and understand what it is and how to use it within 10 seconds, without any onboarding or instructions.
- **SC-002**: Two users in different browsers can have a real-time conversation anchored to a location, with messages appearing for both within 2 seconds.
- **SC-003**: Exploring the map and discovering conversations feels natural — a user can find and open a conversation within 3 clicks of opening the app.
- **SC-004**: The entire experience runs on free-tier infrastructure with zero cost.
- **SC-005**: The app is usable on mobile browsers down to 375px width without horizontal scrolling or broken layouts.
- **SC-006**: All interactive elements are keyboard-accessible and screen-reader-friendly.
