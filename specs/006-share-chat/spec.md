# Feature Specification: Share Chat

**Feature Branch**: `006-share-chat`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "Allow users to share a chat conversation via WhatsApp, email, and other channels from within the chat panel"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Share a conversation via native share sheet (Priority: P1)

A user is reading an interesting conversation on the map and wants to share it with a friend. They tap a share button inside the chat panel header. On mobile, the device's native share sheet appears, letting them choose WhatsApp, email, SMS, or any installed app. The shared content includes the conversation title, a short description with the location, and a direct link to open the conversation in GeoChat.

**Why this priority**: This is the core feature. The native Web Share API covers WhatsApp, email, SMS, and all other apps in a single implementation, and mobile is the primary use case for a location-based app.

**Independent Test**: Can be fully tested by opening any conversation, tapping the share button, and verifying the native share sheet appears with correct conversation details.

**Acceptance Scenarios**:

1. **Given** the user has a conversation open, **When** they tap the share button, **Then** the native share sheet appears with the conversation title, a description including the location, and a link to the conversation.
2. **Given** the user taps the share button and selects WhatsApp, **When** the share completes, **Then** the recipient receives a message with the conversation title and a clickable link.
3. **Given** the user taps the share button and then cancels, **When** the share sheet is dismissed, **Then** the chat panel remains open and unchanged.

---

### User Story 2 - Share via copy-link fallback on desktop (Priority: P2)

A user on a desktop browser (where the Web Share API is often unavailable) wants to share a conversation. They click the share button and see a small dropdown with options: "Copy link", "Email", and "WhatsApp". Selecting "Copy link" copies the conversation URL to the clipboard with a brief confirmation toast. Selecting "Email" or "WhatsApp" opens the respective service in a new tab with pre-filled content.

**Why this priority**: Desktop users need a functional fallback since the native share sheet is not universally available. Copy-link is the most versatile desktop sharing method.

**Independent Test**: Can be tested on a desktop browser by clicking the share button, selecting "Copy link", and verifying the URL is in the clipboard and a confirmation toast appears.

**Acceptance Scenarios**:

1. **Given** the user is on a browser without Web Share API support, **When** they click the share button, **Then** a dropdown menu appears with "Copy link", "Email", and "WhatsApp" options.
2. **Given** the dropdown is visible, **When** the user clicks "Copy link", **Then** the conversation URL is copied to the clipboard and a "Link copied!" toast appears.
3. **Given** the dropdown is visible, **When** the user clicks "Email", **Then** a mailto: link opens with the conversation title as subject and the conversation link in the body.
4. **Given** the dropdown is visible, **When** the user clicks "WhatsApp", **Then** a new tab opens to WhatsApp Web/app with a pre-filled message containing the conversation title and link.
5. **Given** the dropdown is visible, **When** the user clicks outside or presses Escape, **Then** the dropdown closes.

---

### Edge Cases

- What happens when the conversation has no title? Use a fallback like "GeoChat conversation near [location coordinates]".
- What happens when the clipboard API is unavailable (e.g., insecure context)? Show a toast with the link text so the user can manually copy it.
- What happens when the Web Share API call is rejected (permission denied)? Fall back to the dropdown menu.
- What happens when the share link is opened but the conversation has been deleted? The app should show a "conversation not found" message (existing behavior, not part of this feature).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a share button in the conversation panel header, next to the close button.
- **FR-002**: On browsers supporting the Web Share API, tapping the share button MUST invoke the native share sheet.
- **FR-003**: The shared content MUST include: the conversation title, a description with the location (e.g., "A conversation on GeoChat at 45.1885, 5.7245"), and a direct URL to the conversation.
- **FR-004**: On browsers without Web Share API support, clicking the share button MUST display a dropdown menu with "Copy link", "Email", and "WhatsApp" options.
- **FR-005**: The "Copy link" option MUST copy the conversation URL to the user's clipboard and display a confirmation toast.
- **FR-006**: The "Email" option MUST open the user's email client with the conversation title as subject and a message body containing the conversation link.
- **FR-007**: The "WhatsApp" option MUST open WhatsApp with a pre-filled message containing the conversation title and link.
- **FR-008**: The share URL MUST be a deep link that opens the app and navigates directly to the specific conversation on the map.
- **FR-009**: The dropdown menu MUST close when the user clicks outside it, presses Escape, or selects an option.
- **FR-010**: The share button MUST be accessible via keyboard (focusable, activatable with Enter/Space) and have an appropriate aria-label.

### Key Entities

- **Share URL**: A deep link containing the conversation ID and coordinates, allowing recipients to open the exact conversation in GeoChat.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can share a conversation in under 3 taps/clicks (open chat, tap share, select channel).
- **SC-002**: Shared links open the correct conversation on the map when followed by the recipient.
- **SC-003**: 100% of share interactions provide at least one functional sharing method regardless of browser or device.
- **SC-004**: The share button is discoverable — positioned consistently in the chat header alongside existing controls.

## Assumptions

- The app is served over HTTPS, which is required for both the Web Share API and the Clipboard API.
- The conversation URL structure already supports or can support deep linking to a specific conversation (e.g., via query parameters with conversation ID and coordinates).
- The existing toast system in the app will be reused for the "Link copied!" confirmation.
- WhatsApp sharing uses the `https://wa.me/?text=` URL scheme, which works on both mobile and desktop.
- Email sharing uses the standard `mailto:` URL scheme.
