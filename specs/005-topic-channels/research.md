# Research: Topic Channels

**Feature**: 005-topic-channels
**Date**: 2026-02-25

## R1: Channel Data Model Design

**Decision**: Create a `channels` table with a slug-based identifier and add a `channel_id` foreign key to the existing `conversations` table.

**Rationale**:
- Slug provides human-readable URLs (`/channel/skimo`) without exposing UUIDs
- Foreign key ensures referential integrity — conversations cannot exist without a channel
- Conversation count can be derived via query (no denormalized counter needed initially — channel list is small)

**Alternatives considered**:
- **Tag-based system** (many-to-many): Rejected — a conversation belongs to exactly one channel per spec. Simpler FK is sufficient.
- **Enum column on conversations**: Rejected — adding new channels would require schema migration. A separate table allows admin-seeded data.
- **Channel ID in URL query param vs path**: Path chosen (`/channel/[slug]`) for cleaner URLs and native Next.js dynamic routing.

## R2: Routing Strategy

**Decision**: Use Next.js App Router dynamic routes. Root page (`/`) becomes the channel selection screen. Map moves to `/channel/[slug]/page.tsx`.

**Rationale**:
- Native Next.js pattern — no additional routing library needed
- Slug in URL makes channel context shareable and bookmarkable
- Clean separation: channel selection is its own page, map is scoped by channel
- Back navigation is just browser back or a link to `/`

**Alternatives considered**:
- **Client-side state (no URL change)**: Rejected — loses shareability, breaks browser back button, violates web conventions
- **Query parameter (`/?channel=skimo`)**: Rejected — less clean, harder to reason about in App Router

## R3: Handling Existing Conversations (Migration)

**Decision**: Create a default "General" channel and assign all existing conversations to it via migration.

**Rationale**:
- The FK constraint requires every conversation to have a channel_id (NOT NULL)
- A "General" channel serves as a catch-all for pre-existing data
- No data loss — all conversations remain accessible
- Simple, reversible migration

**Alternatives considered**:
- **Nullable channel_id**: Rejected — violates spec requirement that every conversation belongs to exactly one channel
- **Delete existing conversations**: Rejected — data loss is unacceptable
- **Backfill by location/keywords**: Rejected — over-engineered, unreliable, and unnecessary

## R4: Channel Selection UI Pattern

**Decision**: Simple responsive card grid on the root page. Each card shows channel name, description, icon, and conversation count. Tap/click enters the channel.

**Rationale**:
- Minimal UI — consistent with Principle III (simplest thing that works)
- Card grid is standard pattern for selection screens
- No pagination needed (spec assumes <50 channels)
- Tailwind CSS handles responsive grid with no new dependencies

**Alternatives considered**:
- **List layout**: Less visually engaging for a selection screen
- **Map-based channel selection**: Over-engineered, adds complexity without clear value
- **Sidebar with channels + map**: Rejected — spec explicitly says channel selection comes before the map

## R5: Real-Time Considerations

**Decision**: Existing realtime subscriptions on `conversations` table will add a channel_id filter. No new realtime channels needed for the channel list itself.

**Rationale**:
- Channel list is admin-managed and changes rarely — polling or page refresh is sufficient
- Conversation realtime already works — just needs the filter clause
- Avoids adding complexity for a low-frequency update scenario

**Alternatives considered**:
- **Realtime on channels table**: Rejected — channels change so rarely it's not worth the subscription overhead

## R6: Conversation Search Scoping

**Decision**: The existing chat title search (from feature 004) should be scoped to the active channel when used from the map view.

**Rationale**:
- Users expect search results to match the current context (active channel)
- Avoids confusion of seeing results from other channels
- Simple WHERE clause addition to existing query

**Alternatives considered**:
- **Cross-channel search**: Could be a future enhancement but adds scope complexity for V1
