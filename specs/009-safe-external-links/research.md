# Research: Safe External Links

**Feature**: 009-safe-external-links
**Date**: 2026-03-04

## R1: URL Detection Approach

**Decision**: Client-side regex matching for `http://` and `https://` URLs

**Rationale**: The message body is plain text stored as a string. A regex that matches `https?://` followed by valid URL characters is the simplest approach with no dependencies. The regex splits message text into segments (plain text and URLs) for rendering.

**Alternatives considered**:
- **URL constructor parsing**: Would require splitting text first anyway; regex is needed regardless
- **linkify-it / autolinker library**: Adds a dependency for minimal gain; our scope is limited to http/https only
- **Server-side link detection**: Unnecessary complexity; rendering-time detection is sufficient and works with cached/offline messages

**Regex pattern**: `https?:\/\/[^\s<>"')\]]+` — matches http/https URLs up to the next whitespace or common delimiter. Trailing punctuation (`.`, `,`, `)`, `!`, `?`) at the end of a URL should be stripped if it appears to be sentence punctuation rather than part of the URL.

## R2: Confirmation Dialog Pattern

**Decision**: Reuse existing dialog pattern from `create-dialog.tsx` and `nearby-warning.tsx`

**Rationale**: The codebase already has a well-tested dialog pattern with:
- Fixed overlay with `z-[2000]`, centered content
- Click-outside to close
- Escape key handling
- Focus management
- ARIA attributes (`role="dialog"`, `aria-modal="true"`)

A new `link-confirmation-dialog.tsx` component will follow this exact pattern with a simpler layout: URL display, Cancel button, Open Link button.

**Alternatives considered**:
- **Browser `confirm()` dialog**: Poor UX, no styling, blocks thread
- **Toast notification with action**: Doesn't provide clear Cancel/Open flow; too transient
- **Inline popover near the link**: Complex positioning logic, especially in scrollable message lists

## R3: Rendering Strategy

**Decision**: Create a `<LinkifiedText>` component that takes a string and returns a React fragment with text spans and styled anchor elements

**Rationale**: Isolating the linkification logic in its own component:
- Keeps `message-list.tsx` changes minimal (replace `{msg.body}` with `<LinkifiedText text={msg.body} />`)
- Makes the component reusable if links are needed elsewhere (e.g., pending messages)
- Keeps link click interception self-contained

**Flow**:
1. `linkify.ts` utility splits text into `{ type: "text" | "link", value: string }[]` segments
2. `<LinkifiedText>` maps segments to `<span>` (text) or styled `<button>` (links)
3. Clicking a link-button sets state to show `<LinkConfirmationDialog>` with the URL
4. Dialog Cancel → clear state; Dialog Open → `window.open(url, "_blank", "noopener,noreferrer")`

**Why `<button>` instead of `<a>`**: Using a button prevents default navigation entirely. No need for `e.preventDefault()` — the click handler shows the dialog, and only the "Open Link" action triggers `window.open`. This is safer and more accessible (buttons for actions, links for navigation).

## R4: Link Styling

**Decision**: Links styled with underline and color differentiation based on message bubble color

**Rationale**: Links must be visually distinct from surrounding text per FR-002.
- **Own messages** (blue background, white text): Links use `underline text-white` — underline provides distinction
- **Other messages** (gray background, dark text): Links use `underline text-blue-600` — standard link color

This matches user expectations for link appearance without introducing new color variables.

## R5: Long URL Handling

**Decision**: Truncate display in message bubble with CSS (`max-width` + `overflow: hidden` + `text-overflow: ellipsis` on inline display), show full URL in confirmation dialog

**Rationale**: Very long URLs (500+ characters) can break message bubble layout. CSS truncation is the simplest approach — the full URL is always visible in the confirmation dialog where space is less constrained.

## R6: Security Considerations

**Decision**: Strict allowlist of `http://` and `https://` protocols only; open links with `noopener,noreferrer`

**Rationale**:
- `javascript:` and `data:` URLs could execute arbitrary code — must never be rendered as clickable
- `noopener` prevents the opened page from accessing `window.opener`
- `noreferrer` prevents leaking the referrer URL
- No URL shortening or aliasing prevents phishing via text/href mismatch

## R7: i18n Keys

**Decision**: Add keys under `linkDialog.*` namespace

**New keys**:
- `linkDialog.title` — "Open external link"
- `linkDialog.description` — "You are about to open an external link. Please verify the URL before proceeding."
- `linkDialog.url` — "URL:"
- `linkDialog.cancel` — (reuse `common.cancel` if available, otherwise add)
- `linkDialog.open` — "Open link"
- `linkDialog.ariaLabel` — "External link confirmation"
