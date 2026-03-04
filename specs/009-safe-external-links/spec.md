# Feature Specification: Safe External Links

**Feature Branch**: `009-safe-external-links`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "Right now there is no restriction when writing a message, so you can include a link. We need the links to be clickable but we need to include a warning message to make the user know the link is going to be opened and to allow to cancel or accept"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clickable Links in Messages (Priority: P1)

A user sends a chat message containing a URL (e.g., "Check out https://example.com for details"). When other users (or the sender) view that message, the URL is displayed as a clickable link with a distinct visual style (underlined, different color) so it is clearly recognizable as a link. Currently, URLs appear as plain unclickable text.

**Why this priority**: This is the foundational capability — without link detection, there is nothing to warn about. It directly improves communication by making shared links actionable.

**Independent Test**: Can be fully tested by sending a message containing a URL and verifying it renders as a visually distinct, tappable/clickable element.

**Acceptance Scenarios**:

1. **Given** a message contains a valid URL (e.g., `https://example.com`), **When** the message is displayed, **Then** the URL is rendered as a visually distinct clickable link.
2. **Given** a message contains multiple URLs, **When** the message is displayed, **Then** each URL is rendered as a separate clickable link while surrounding text remains normal.
3. **Given** a message contains no URLs, **When** the message is displayed, **Then** the message renders as plain text with no changes to current behavior.

---

### User Story 2 - Warning Confirmation Before Opening Link (Priority: P1)

When a user taps or clicks a link inside a chat message, instead of navigating immediately, a confirmation dialog appears. The dialog shows the full destination URL and offers two options: "Cancel" (stay in the app) and "Open Link" (proceed to the URL in a new tab/window). This protects users from accidentally leaving the app or visiting unexpected destinations.

**Why this priority**: This is the core safety feature requested. Without the warning, clickable links could expose users to phishing or unwanted navigation.

**Independent Test**: Can be fully tested by clicking any detected link in a message and verifying the confirmation dialog appears with correct URL, and that both Cancel and Open actions work correctly.

**Acceptance Scenarios**:

1. **Given** a user clicks a link in a chat message, **When** the click is intercepted, **Then** a confirmation dialog appears showing the full destination URL.
2. **Given** the confirmation dialog is displayed, **When** the user selects "Cancel", **Then** the dialog closes and no navigation occurs.
3. **Given** the confirmation dialog is displayed, **When** the user selects "Open Link", **Then** the URL opens in a new browser tab/window and the user remains in the app.
4. **Given** the confirmation dialog is displayed, **When** the user presses Escape or clicks outside the dialog, **Then** the dialog closes and no navigation occurs (same as Cancel).

---

### User Story 3 - Safe Display of Untrusted URLs (Priority: P2)

The system displays the raw URL text as-is from the message. No URL shortening, no rich previews, and no fetching of external content is performed. The link text shown in the message and in the confirmation dialog is always the exact URL the user will be taken to, preventing mismatch between displayed text and actual destination.

**Why this priority**: Prevents social engineering where a message could trick users into clicking a link that goes somewhere unexpected.

**Independent Test**: Can be tested by sending messages with various URL formats and verifying the displayed link text always matches the actual destination shown in the confirmation dialog.

**Acceptance Scenarios**:

1. **Given** a message contains a URL, **When** displayed as a clickable link, **Then** the link text shown is the exact URL string from the message (no shortening or aliasing).
2. **Given** a user clicks a link and the confirmation dialog appears, **When** the user reads the dialog, **Then** the URL shown in the dialog matches exactly the link text in the message.

---

### Edge Cases

- What happens when a message contains a very long URL (500+ characters)? The link should be displayed with text truncation in the message bubble but the full URL should be visible in the confirmation dialog.
- What happens when a message contains a URL without a protocol (e.g., `example.com`)? Only URLs with explicit protocols (`http://` or `https://`) are detected as links. Plain domain names remain as plain text.
- What happens when a message contains email addresses (e.g., `user@example.com`)? Email addresses are not treated as clickable links.
- What happens when a message contains `javascript:`, `data:`, or other non-HTTP protocol URLs? Only `http://` and `https://` URLs are made clickable. All other protocols are ignored for safety.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect URLs with `http://` or `https://` protocols in message text and render them as clickable links.
- **FR-002**: System MUST visually distinguish links from surrounding plain text (e.g., underline, color differentiation).
- **FR-003**: System MUST intercept all link clicks in chat messages and display a confirmation dialog before navigating.
- **FR-004**: The confirmation dialog MUST display the full destination URL so users can verify where they will be taken.
- **FR-005**: The confirmation dialog MUST provide a "Cancel" action that closes the dialog without any navigation.
- **FR-006**: The confirmation dialog MUST provide an "Open Link" action that opens the URL in a new browser tab/window.
- **FR-007**: The confirmation dialog MUST be dismissible via Escape key or clicking outside (behaving as Cancel).
- **FR-008**: System MUST NOT detect or make clickable any URLs with protocols other than `http://` and `https://` (e.g., `javascript:`, `data:`, `ftp:`).
- **FR-009**: System MUST NOT modify, shorten, or preview URLs — the displayed link text must match the actual destination.
- **FR-010**: System MUST NOT fetch any external content for link previews or metadata.
- **FR-011**: Links MUST open in a new tab/window (not replace the current app) to preserve the user's chat session.
- **FR-012**: System MUST preserve existing plain-text rendering behavior for messages that contain no URLs.
- **FR-013**: The link detection and warning behavior MUST apply equally to the sender's own messages and messages from other users.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid HTTP/HTTPS URLs in chat messages are rendered as clickable links.
- **SC-002**: 100% of link clicks trigger the confirmation dialog before any navigation occurs.
- **SC-003**: Users can identify the destination URL in the confirmation dialog before deciding to proceed.
- **SC-004**: No external content is fetched or loaded when rendering messages containing links.
- **SC-005**: Existing message display behavior is fully preserved for messages without URLs.
- **SC-006**: Non-HTTP protocols (javascript:, data:, ftp:) are never rendered as clickable links.

## Assumptions

- The current message body is stored and transmitted as plain text — no HTML or markdown parsing exists or is needed.
- Link detection is client-side only; no changes to the database schema or message storage are required.
- The confirmation dialog follows existing UI patterns in the app (similar to other modal/dialog components).
- The feature applies to all messages (real-time and historical) as rendering happens at display time.
- No "trusted domains" allowlist is needed at this stage — all external links show the warning.
