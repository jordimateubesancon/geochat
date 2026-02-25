# Quickstart: Topic Channels

**Feature**: 005-topic-channels
**Date**: 2026-02-25

## Prerequisites

- Node.js 18+
- Existing geochat development environment set up
- Supabase project with existing `conversations` and `messages` tables
- Environment variables configured: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Setup Steps

### 1. Run Database Migration

Apply the new migration to add the `channels` table and update `conversations`:

```bash
# If using Supabase CLI (local dev)
supabase db push

# Or apply manually via Supabase Dashboard SQL Editor:
# Copy contents of supabase/migrations/YYYYMMDD_add_channels.sql
```

This migration will:
- Create the `channels` table with RLS policies
- Seed 6 default channels (General, Skimo, Rock Climbing, Trail Running, Hiking, Mountain Biking)
- Add `channel_id` column to `conversations`
- Assign all existing conversations to the "General" channel
- Update RPC functions to filter by channel

### 2. Verify Migration

After migration, confirm:
- `channels` table exists with 6 rows
- All existing conversations have `channel_id` set (no NULLs)
- RPC functions `conversations_in_bounds` and `conversations_nearby` accept `channel_id` parameter

### 3. Start Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000` — you should see the channel selection screen instead of the map.

## Key Development Paths

| Task | Files to modify |
|------|-----------------|
| Channel selection UI | `src/app/page.tsx`, `src/components/channel-grid.tsx`, `src/components/channel-card.tsx` |
| Map page with channel context | `src/app/channel/[slug]/page.tsx`, `src/components/map-inner.tsx` |
| Conversation filtering | `src/hooks/use-conversations.ts` |
| Conversation creation | `src/hooks/use-create-conversation.ts`, `src/components/create-dialog.tsx` |
| Type definitions | `src/types/index.ts` |
| Database migration | `supabase/migrations/` |

## Testing

```bash
# Run all tests
npm test

# Run linting
npm run lint
```

## Adding New Channels

Channels are admin-managed. To add a new channel:

1. Insert a row into the `channels` table via Supabase Dashboard or SQL
2. Provide: `name`, `slug` (URL-safe), `description`, `icon` (emoji), `sort_order`
3. The channel appears automatically on the selection screen
