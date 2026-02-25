# Quickstart: Chat Title Search with Dual Search Mode

**Feature Branch**: `004-chat-title-search`
**Date**: 2026-02-25

## Prerequisites

- Node.js 18+ and npm
- Existing GeoChat development environment
- Supabase project with conversations table (already set up from 001-geochat-mvp)

## Setup

No additional setup required. This feature uses the existing Supabase client and conversations table.

No new npm packages to install.

## Development

```bash
git checkout 004-chat-title-search
npm run dev
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/use-conversation-search.ts` | Supabase conversation title search hook |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/location-search.tsx` | Add search mode toggle, dual-mode results, new `onSelectConversation` prop |
| `src/components/map-inner.tsx` | Pass `onSelectConversation` callback to search component |

## Key Implementation Notes

1. **Supabase query**: `supabase.from("conversations").select("*").ilike("title", `%${query}%`).limit(10).order("created_at", { ascending: false })`
2. **Debounce**: 300ms, minimum 2 characters for chat search.
3. **AbortController**: Use `{ signal }` option in Supabase `.select()` for cancellation.
4. **Toggle**: Segmented pill with "Places" / "Chats" labels using Tailwind classes.
5. **Selection**: Chat result selection calls `onSelectConversation(conversation)` which flies the map and opens the panel.

## Verification

After implementation, verify:
- [ ] Toggle visible with "Places" and "Chats" options
- [ ] "Places" is the default active mode
- [ ] Switching modes clears results and updates placeholder
- [ ] Chat search for a known conversation title returns results
- [ ] Selecting a chat result flies map and opens conversation panel
- [ ] Searching for nonsense in chat mode shows "No conversations found"
- [ ] Keyboard navigation (arrows, Enter, Escape) works in both modes
- [ ] No console errors or TypeScript warnings
