# Quickstart: Share Chat

**Feature Branch**: `006-share-chat`
**Date**: 2026-02-26

## What This Feature Does

Adds a share button to the conversation panel header. On mobile, it triggers the native share sheet. On desktop, it shows a dropdown with "Copy link", "Email", and "WhatsApp" options. Shared links deep-link directly to the conversation on the map.

## Files to Create

- `src/components/share-button.tsx` — Share button with Web Share API + dropdown fallback

## Files to Modify

- `src/components/conversation-panel.tsx` — Add share button to header
- `src/app/channel/[slug]/page.tsx` — Read `?c=` query param and pass to Map
- `src/components/map-inner.tsx` — Accept initial conversation ID, fetch and auto-open it

## Key Technical Decisions

1. **URL scheme**: `/channel/[slug]?c=[conversationId]` (query param on existing route, no new pages)
2. **Share API**: `navigator.share()` on supported browsers, dropdown fallback otherwise
3. **No new dependencies**: Uses only browser APIs (Web Share, Clipboard, mailto:, wa.me)
4. **No database changes**: Everything is client-side URL construction

## Testing

```bash
npm test && npm run lint
```

Manual testing:
1. Open a conversation, tap share button — native share sheet on mobile, dropdown on desktop
2. Share via WhatsApp/email — verify link content is correct
3. Open a shared link — verify map centers on conversation and panel opens
4. Test on browser without Web Share API — verify dropdown fallback works
