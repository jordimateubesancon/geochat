# Research: Share Chat

**Feature Branch**: `006-share-chat`
**Date**: 2026-02-26

## R1: Deep Linking Strategy

**Decision**: Use URL query parameters on the existing channel route: `/channel/[slug]?c=[conversationId]`

**Rationale**:
- The app currently has no conversation-level routing — conversations are opened via in-memory state when a marker is clicked
- Adding a new dynamic route segment (`/channel/[slug]/[conversationId]`) would require a new Next.js page file and duplicating the map rendering logic
- Query parameters are simpler: the existing channel page reads `?c=<id>` on mount, fetches the conversation, centers the map, and opens the panel
- This keeps the routing flat and avoids breaking existing URLs

**Alternatives considered**:
- `/channel/[slug]/[conversationId]` — cleaner URL but requires new page file, duplicated layout, and more routing complexity
- Hash-based (`#conversation=<id>`) — not indexable, harder to parse

## R2: Web Share API Support & Fallback

**Decision**: Use `navigator.share()` when available, fall back to a dropdown menu with Copy link / Email / WhatsApp options.

**Rationale**:
- Web Share API is supported on all major mobile browsers (Safari iOS, Chrome Android) which are the primary target
- Desktop Chrome supports it too, but Firefox and some others don't
- Feature-detecting with `navigator.share` is trivial
- The fallback dropdown covers desktop users with direct `mailto:` and `https://wa.me/` links plus clipboard copy

**Alternatives considered**:
- Always show dropdown (no native share) — misses the native UX advantage on mobile
- Third-party share libraries (react-share, etc.) — adds a dependency for something achievable with browser APIs; violates constitution principle II (minimal dependencies)

## R3: Clipboard API Fallback

**Decision**: Use `navigator.clipboard.writeText()` with a toast fallback showing the URL text if clipboard is unavailable.

**Rationale**:
- Clipboard API requires HTTPS (already assumed) and a secure context
- On rare browsers where it fails, showing the URL in a selectable toast lets users manually copy
- No need for the deprecated `document.execCommand('copy')` approach

## R4: Share URL Construction

**Decision**: Build the URL as `${window.location.origin}/channel/${channelSlug}?c=${conversationId}`

**Rationale**:
- Uses the existing channel slug routing
- The conversation ID is a UUID, safe for URL params
- `window.location.origin` ensures correct domain in all environments (dev, staging, prod)
- The channel page component will check for the `c` query param on mount and auto-open the conversation

## R5: Fetching a Conversation by ID for Deep Links

**Decision**: Add a simple Supabase query to fetch a single conversation by ID when the `?c=` param is present.

**Rationale**:
- The existing `useConversations` hook fetches by map bounds, which won't include a conversation outside the current viewport
- A targeted `supabase.from('conversations').select('*').eq('id', conversationId).single()` is the simplest approach
- Once fetched, center the map on the conversation's coordinates and open the panel
