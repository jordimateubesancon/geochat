# Feature Specification: Offline Mode

**Feature Branch**: `008-offline-mode`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "A new feature is needed! As this application could be interesting for outdoor activities, we need to implement a system to allow the app to work off-line"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Previously Viewed Conversations Offline (Priority: P1)

A hiker opens GeoChat while in an area with no cell coverage. They had previously browsed conversations in this area while online. The app detects the lack of connectivity, shows a clear offline indicator, and displays the cached conversations and messages on the map. The user can read message threads they previously opened. They cannot send messages or create new conversations, but they can still navigate the map in the area they had previously viewed.

**Why this priority**: This is the core offline value — users in the mountains can still access information they previously loaded. Without this, the app is completely useless without connectivity.

**Independent Test**: Can be tested by loading conversations while online, then disabling the network and verifying cached data is still visible and readable.

**Acceptance Scenarios**:

1. **Given** the user previously viewed conversations in an area while online, **When** they open the app without connectivity, **Then** those conversations and their messages appear on the map as they were last seen.
2. **Given** the user is offline, **When** they tap a cached conversation marker, **Then** the conversation panel opens with previously loaded messages.
3. **Given** the user is offline, **When** the app loads, **Then** a visible indicator shows they are in offline mode.
4. **Given** the user is offline, **When** they navigate the map to an area they never viewed online, **Then** the map shows blank tiles and no conversation markers for that area.

---

### User Story 2 - Map Tile Caching for Offline Navigation (Priority: P2)

A trail runner plans their route at home with connectivity, browsing the topographic map in the area they intend to run. Later, on the trail without signal, they open GeoChat and can still see the map tiles for the areas they previously viewed. The cached tiles allow them to orient themselves using the topographic map even without internet.

**Why this priority**: The topographic map is arguably the most valuable offline asset for outdoor users. Without cached tiles, the user sees a blank screen — making cached conversations useless since they lose spatial context.

**Independent Test**: Can be tested by panning/zooming the map in an area while online, then going offline and verifying the same tiles render correctly.

**Acceptance Scenarios**:

1. **Given** the user browsed a map area at various zoom levels while online, **When** they view the same area offline, **Then** the previously loaded tiles display correctly.
2. **Given** cached tiles exist, **When** the user navigates to an uncached area, **Then** a placeholder or grey tile is shown instead of a broken image.
3. **Given** the tile cache is approaching its storage limit, **When** new tiles are loaded online, **Then** the oldest tiles are evicted to make room.

---

### User Story 3 - Queue Messages While Offline (Priority: P3)

A mountain biker finds a trail condition they want to report in an existing conversation. They have no signal but compose a message anyway. The app stores the message locally and shows it as "pending." When connectivity returns, the message is automatically sent and the pending indicator disappears.

**Why this priority**: Enables active participation even without connectivity. Less critical than reading cached data (P1/P2) since outdoor users primarily need to consume information while offline, but still valuable for reporting conditions, hazards, or trail notes.

**Independent Test**: Can be tested by composing a message while offline, then restoring connectivity and verifying the message appears in the conversation for all users.

**Acceptance Scenarios**:

1. **Given** the user is offline viewing a cached conversation, **When** they type and send a message, **Then** the message appears in the thread with a "pending" indicator.
2. **Given** there are pending messages, **When** connectivity is restored, **Then** messages are sent automatically in the order they were composed.
3. **Given** a pending message fails to sync after connectivity returns (e.g., conversation was deleted), **When** the sync fails, **Then** the user is notified and the message remains visible with an error indicator and a retry option.
4. **Given** the user is offline, **When** they try to create a new conversation, **Then** the action is disabled with a message explaining it requires connectivity.

---

### User Story 4 - Connectivity Transition Handling (Priority: P4)

A hiker moves between areas of patchy coverage. The app seamlessly transitions between online and offline states: when connectivity returns, it syncs any pending messages, refreshes stale cached data, and removes the offline indicator. When connectivity drops again, it falls back to cached data without disruption.

**Why this priority**: Smooth transitions prevent data loss and user confusion. Without this, users in areas with intermittent signal would experience jarring state changes.

**Independent Test**: Can be tested by toggling airplane mode repeatedly and verifying the app transitions smoothly, syncs pending data, and never loses user-composed content.

**Acceptance Scenarios**:

1. **Given** the app is offline with pending messages, **When** connectivity is restored, **Then** pending messages sync automatically and their status updates to "sent."
2. **Given** the app transitions from offline to online, **When** the sync completes, **Then** cached data is refreshed with the latest server data.
3. **Given** connectivity drops while the user is composing a message, **When** they hit send, **Then** the message is queued locally (not lost) and a notification confirms it will be sent when back online.

---

### Edge Cases

- What happens when the device storage is full and the app cannot cache new data? The app should gracefully degrade and inform the user that offline data may be limited.
- What happens when a cached conversation was deleted by another user while the current user was offline? The conversation should be removed from cache on next sync, with no error shown to the user.
- What happens when multiple pending messages exist for the same conversation and connectivity is restored? Messages must be sent in chronological order to preserve conversation flow.
- What happens when the app is force-closed while offline? Cached data and pending messages must persist across app restarts.
- What happens when the user clears browser data? All cached content and pending messages are lost — this is expected browser behavior and does not need special handling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST detect connectivity status changes (online/offline) and display a clear visual indicator when offline.
- **FR-002**: The app MUST cache conversation data (titles, locations, message counts) as users browse, so it is available offline.
- **FR-003**: The app MUST cache message content for conversations the user has opened, so messages are readable offline.
- **FR-004**: The app MUST cache map tiles as they are loaded, so previously viewed map areas render offline.
- **FR-005**: The app MUST set a maximum storage limit for cached map tiles and evict the oldest tiles when the limit is reached.
- **FR-006**: The app MUST cache the channel list so users can see available channels offline.
- **FR-007**: The app MUST allow users to compose and "send" messages while offline, queuing them locally.
- **FR-008**: Pending (queued) messages MUST display with a visual indicator distinguishing them from sent messages.
- **FR-009**: When connectivity is restored, the app MUST automatically sync pending messages in chronological order.
- **FR-010**: If a pending message fails to sync, the app MUST notify the user and provide a retry option.
- **FR-011**: The app MUST disable conversation creation while offline, with a clear explanation to the user.
- **FR-012**: Cached data and pending messages MUST persist across browser/app restarts.
- **FR-013**: When transitioning from offline to online, the app MUST refresh cached data with the latest server data.
- **FR-014**: The app MUST install as a Progressive Web App (PWA) so it can launch from the home screen without a browser tab.

### Key Entities

- **CachedConversation**: A locally stored snapshot of a conversation's metadata (title, location, message count, last viewed timestamp). Linked to the channel it belongs to.
- **CachedMessage**: A locally stored copy of a message (author, body, timestamp). Linked to its parent conversation.
- **PendingMessage**: A user-composed message awaiting sync. Contains the message body, target conversation, author name, and a status (pending, sending, failed). Linked to a cached conversation.
- **TileCache**: Stored map tile images indexed by coordinates and zoom level, with timestamps for eviction ordering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view previously loaded conversations and messages within 2 seconds of opening the app while offline.
- **SC-002**: Previously viewed map areas render correctly offline with no broken tile images.
- **SC-003**: 100% of pending messages are delivered when connectivity is restored, in the correct chronological order.
- **SC-004**: The offline indicator appears within 3 seconds of losing connectivity and disappears within 3 seconds of regaining it.
- **SC-005**: Cached data persists across browser restarts — reopening the app offline shows the same data as the previous session.
- **SC-006**: The app can be installed as a PWA and launched from the home screen on mobile devices.
- **SC-007**: Tile cache storage does not exceed 50 MB per user, with automatic eviction of oldest tiles.

## Assumptions

- Users will have visited areas of interest while online before needing offline access; the app does not pre-download areas the user has never viewed.
- The tile cache storage limit of 50 MB is a reasonable default for mobile devices; this provides approximately 2,000–5,000 tiles depending on resolution.
- Creating new conversations offline is intentionally excluded from scope because it requires server-side geospatial validation (nearby conversation check) that cannot run locally.
- The Nominatim location search feature will be unavailable offline — no local geocoding is provided.
- The conversation title search feature will work against cached data only while offline.
