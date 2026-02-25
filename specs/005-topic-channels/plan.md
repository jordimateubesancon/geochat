# Implementation Plan: Topic Channels

**Branch**: `005-topic-channels` | **Date**: 2026-02-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-topic-channels/spec.md`

## Summary

Add a "channel" concept that groups conversations by outdoor activity topic (e.g., Skimo, Rock Climbing). Users must select a channel before accessing the map. The map then shows only conversations belonging to that channel. Requires a new `channels` database table, a foreign key from `conversations` to `channels`, a new channel selection page, and filtering of all conversation queries by channel.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any` types)
**Primary Dependencies**: Next.js 14, React 18+, react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js
**Storage**: Supabase (PostgreSQL + PostGIS) — new `channels` table + FK on `conversations`
**Testing**: Vitest (unit), Playwright (e2e) — consistent with project patterns
**Target Platform**: Web (responsive, no mobile app)
**Project Type**: Web application (Next.js App Router, client-side rendering)
**Performance Goals**: Channel list loads in <2s, channel switch <3s (map re-query)
**Constraints**: Free-tier Supabase, anonymous users, no authentication required
**Scale/Scope**: <50 channels, existing conversation volume per channel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero-Budget, Zero-Friction | PASS | No new paid services. Uses existing Supabase free tier. Single new table + FK. |
| II. Open Source First | PASS | No new dependencies. All existing OSS stack. |
| III. Ship the Simplest Thing | PASS | Minimal new entities (1 table, 1 FK). Admin-seeded channels via SQL — no admin UI needed. Channel selection is a simple list page. |
| IV. Real-Time Is Core | PASS | Realtime subscriptions remain unchanged — just scoped by channel_id filter. |
| V. Location Is First-Class | PASS | No changes to geospatial handling. Conversations still have coordinates. |
| VI. Anonymous by Default | PASS | No auth changes. Channel selection requires no identity. |
| VII. The Map Is the Interface | CAUTION | Channel selection screen is a new non-map screen that gates access. Justified because it scopes the map experience — the map remains the primary interface once a channel is selected. Minimal UI: card grid, one tap to enter. |

**Gate result**: PASS (Principle VII noted but justified — channel selection is a lightweight gateway, not a competing interface)

## Project Structure

### Documentation (this feature)

```text
specs/005-topic-channels/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                    # Root layout (unchanged)
│   ├── page.tsx                      # Channel selection page (replaces current map entry)
│   └── channel/[slug]/
│       └── page.tsx                  # Map page scoped to a channel
├── components/
│   ├── channel-card.tsx              # NEW: Single channel card for selection grid
│   ├── channel-grid.tsx              # NEW: Grid layout of channel cards
│   ├── map.tsx                       # Existing (unchanged — dynamic import wrapper)
│   ├── map-inner.tsx                 # Modified (receives channelId prop, passes to hooks)
│   ├── create-dialog.tsx             # Modified (channelId passed through)
│   └── top-bar.tsx                   # Modified (shows active channel name + back link)
├── hooks/
│   ├── use-channels.ts              # NEW: Fetch all channels with conversation counts
│   ├── use-conversations.ts         # Modified (adds channel_id filter to queries)
│   └── use-create-conversation.ts   # Modified (includes channel_id on insert)
├── types/
│   └── index.ts                     # Modified (add Channel type, update Conversation type)
└── lib/
    └── supabase.ts                  # Unchanged

supabase/migrations/
└── YYYYMMDD_add_channels.sql        # NEW: channels table, FK, seed data, RLS
```

**Structure Decision**: Follows existing Next.js App Router pattern. Channel selection becomes the root page (`/`), and the map moves to `/channel/[slug]` using dynamic routing. This is the simplest approach — no new libraries, no state management, just URL-based routing.

## Complexity Tracking

> No violations to justify. Design follows Principle III throughout.
