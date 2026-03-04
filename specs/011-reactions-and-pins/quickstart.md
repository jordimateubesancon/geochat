# Quickstart: Message Reactions & Personal Pins

**Feature**: 011-reactions-and-pins
**Date**: 2026-03-04

## Prerequisites

- Node.js 18+
- Supabase project with existing geochat schema (messages, conversations, channels)
- Access to Supabase dashboard for running migrations

## Setup Steps

### 1. Database Migration

Run the new migration to create the `message_reactions` table:

```bash
# Apply via Supabase CLI or dashboard SQL editor
supabase db push
# Or manually run the migration SQL in the Supabase dashboard
```

The migration creates:
- `message_reactions` table with UNIQUE constraint on (message_id, user_session_id)
- Indexes on message_id and conversation_id
- RLS policies for anonymous read/write access
- Realtime enabled on the table

### 2. Enable Realtime

In Supabase dashboard → Database → Replication:
- Ensure `message_reactions` table has realtime enabled for INSERT, UPDATE, DELETE events

### 3. Run Development Server

```bash
npm run dev
```

### 4. Verify

1. Open a conversation with messages
2. Hover over a message — thumbs-up/down icons should appear
3. Tap thumbs-up — count should increment to 1, icon highlighted
4. Open same conversation in another browser tab — count should appear in real time
5. Tap pin icon on a message — should appear in pinned section at top
6. Pin 3 messages, try pinning a 4th — should see limit warning
7. Close and reopen conversation — pins should persist

## Key Files

| File | Purpose |
|------|---------|
| `supabase/migrations/XXX_add_reactions.sql` | Database schema for reactions |
| `src/types/index.ts` | TypeScript interfaces for Reaction |
| `src/hooks/use-reactions.ts` | Reaction state, optimistic updates, realtime |
| `src/hooks/use-pins.ts` | Pin state management with localStorage |
| `src/components/reaction-buttons.tsx` | Inline thumbs-up/down UI per message |
| `src/components/pinned-messages.tsx` | Pinned section at top of chat |
| `src/components/message-list.tsx` | Updated to include reactions + pins |
| `src/lib/offline-db.ts` | Updated with pending_reactions store |
| `src/messages/en.json` | New i18n keys for reactions/pins |

## i18n

After making changes to English strings:

```bash
npm run i18n            # Check what needs translating
npm run i18n -- --sync  # Snapshot after translations are done
```
