# Feature Specification: Message Reactions & Personal Pins

**Feature Branch**: `011-reactions-and-pins`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "We want the user to: 1 - be able to mark a message as interesting (thumbs up) or not interesting (thumbs down) with visible counters. 2 - be able to pin a message (personal, max 3) shown at the top of the chat."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - React to a Message (Priority: P1)

A user reading a conversation wants to express agreement or disagreement with a message by tapping a thumbs-up or thumbs-down icon. The reaction counts are visible to everyone in the chat, giving a quick sense of community sentiment on each message.

**Why this priority**: Reactions are the core social feature — they add value to every message in every conversation and are visible to all users.

**Independent Test**: Can be fully tested by opening a conversation, reacting to a message, and verifying the count updates for all participants.

**Acceptance Scenarios**:

1. **Given** a user is viewing a conversation with messages, **When** they tap the thumbs-up icon on a message, **Then** the thumbs-up count increments by 1 and their reaction is visually indicated.
2. **Given** a user has already reacted with thumbs-up on a message, **When** they tap the thumbs-up icon again, **Then** their reaction is removed and the count decrements by 1.
3. **Given** a user has reacted with thumbs-up, **When** they tap the thumbs-down icon on the same message, **Then** their thumbs-up is removed and replaced with a thumbs-down (switching reaction).
4. **Given** multiple users react to the same message, **When** any user views the conversation, **Then** they see the aggregate count for each reaction type.
5. **Given** a user reacts to a message, **When** another user is viewing the same conversation in real time, **Then** the reaction count updates live without requiring a page refresh.

---

### User Story 2 - Pin a Message for Personal Reference (Priority: P2)

A user wants to pin important messages (up to 3) so they appear at the top of the chat panel for quick reference. Pins are personal — only the user who pinned sees them. This helps users keep track of key information (meeting points, coordinates, safety warnings) without scrolling.

**Why this priority**: Pinning adds personal utility but is only visible to the individual user, so it has less community impact than reactions.

**Independent Test**: Can be fully tested by pinning a message, verifying it appears at the top, and confirming other users do not see the pin.

**Acceptance Scenarios**:

1. **Given** a user is viewing a conversation, **When** they tap the pin icon on a message, **Then** the message appears in a pinned section at the top of the chat.
2. **Given** a user has 3 pinned messages in a conversation, **When** they try to pin a 4th message, **Then** the system informs them they have reached the maximum and does not pin the message.
3. **Given** a user has pinned a message, **When** they tap the unpin icon on the pinned message, **Then** the message is removed from the pinned section.
4. **Given** User A has pinned a message, **When** User B views the same conversation, **Then** User B does not see any indication that the message is pinned.
5. **Given** a user has pinned messages in a conversation, **When** they close and reopen the conversation, **Then** their pinned messages are still visible at the top.
6. **Given** a user taps on a pinned message in the pinned section, **When** the tap is registered, **Then** the chat scrolls to the original message position in the conversation.

---

### User Story 3 - View Reaction Details (Priority: P3)

A user wants to see who reacted to a message. When they tap on the reaction count, a small tooltip or popover shows the display names of users who reacted.

**Why this priority**: Nice-to-have social feature that adds transparency but is not essential for the core reaction functionality.

**Independent Test**: Can be tested by reacting to a message, tapping the count, and verifying the list of display names appears.

**Acceptance Scenarios**:

1. **Given** a message has reactions, **When** the user taps on the reaction count, **Then** a popover shows the display names of users who gave that reaction (up to 10 names, with "+N more" if exceeding).
2. **Given** a message has no reactions, **When** the user views the message, **Then** no reaction counts are displayed (zero counts are hidden).

---

### Edge Cases

- What happens when a user reacts while offline? The reaction is queued locally and synced when connectivity returns, following the existing offline-first pattern.
- What happens when a pinned message is deleted from the conversation? The pin is automatically removed from the pinned section.
- What happens when the user's session expires and they get a new display name? Pins are tied to the session ID stored in localStorage. If the session is lost, pins are lost (acceptable for anonymous users). Reactions persist server-side regardless.
- What happens when two users react at the exact same time? The server maintains accurate counts — each reaction is an individual record, so concurrent reactions do not conflict.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to add a thumbs-up or thumbs-down reaction to any message in a conversation.
- **FR-002**: System MUST display aggregate reaction counts (thumbs-up and thumbs-down separately) on each message that has at least one reaction.
- **FR-003**: System MUST visually indicate when the current user has reacted to a message (highlight their active reaction).
- **FR-004**: System MUST allow users to remove their own reaction by tapping the same reaction icon again.
- **FR-005**: System MUST allow users to switch their reaction (e.g., from thumbs-up to thumbs-down) in a single action.
- **FR-006**: System MUST broadcast reaction changes in real time to all users viewing the same conversation.
- **FR-007**: System MUST allow users to pin up to 3 messages per conversation for personal reference.
- **FR-008**: System MUST display pinned messages in a dedicated section at the top of the chat panel.
- **FR-009**: System MUST keep pins private — only visible to the user who created them.
- **FR-010**: System MUST persist pins locally so they survive page refreshes and conversation close/reopen.
- **FR-011**: System MUST allow users to unpin a message, removing it from the pinned section.
- **FR-012**: System MUST prevent users from pinning more than 3 messages per conversation, showing a clear message when the limit is reached.
- **FR-013**: System MUST allow users to tap a pinned message to scroll to its original position in the conversation.
- **FR-014**: Each user MUST be limited to one reaction per message (either thumbs-up or thumbs-down, not both).
- **FR-015**: Messages with zero reactions MUST NOT show any reaction UI clutter (counts hidden).

### Key Entities

- **Reaction**: Represents a user's sentiment on a message. Attributes: the message it belongs to, the user who reacted (session ID + display name), and the reaction type (thumbs-up or thumbs-down). One reaction per user per message. Visible to all users.
- **Pin**: Represents a user's personal bookmark on a message within a conversation. Attributes: the message it references, the conversation it belongs to, and the user who pinned it (session ID). Maximum 3 per user per conversation. Private to the pinning user.

## Assumptions

- Reactions are stored server-side (Supabase) since they are shared across all users.
- Pins are stored client-side (localStorage) since they are personal and the app uses anonymous sessions — no server-side user accounts exist to associate pins with.
- The existing anonymous session model (sessionId + displayName in localStorage) is used to identify users for both reactions and pins.
- Reaction UI (thumbs icons + counts) appears inline on each message bubble, keeping the design lightweight.
- The pinned messages section at the top of the chat shows a compact preview (author, truncated body) rather than the full message.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can react to a message with a single tap and see the updated count within 1 second.
- **SC-002**: Reaction count updates propagate to all connected users viewing the same conversation within 2 seconds.
- **SC-003**: Users can pin a message with a single tap and see it appear at the top of the chat immediately.
- **SC-004**: Pinned messages persist across page refreshes with 100% reliability.
- **SC-005**: Other users never see another user's pinned messages (complete privacy).
- **SC-006**: The pin limit of 3 per conversation is enforced consistently, with a clear user-facing message when exceeded.
- **SC-007**: Tapping a pinned message scrolls to the original message position within 500ms.
