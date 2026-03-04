# Research: Message Reactions & Personal Pins

**Feature**: 011-reactions-and-pins
**Date**: 2026-03-04

## R1: Reactions Storage Strategy

**Decision**: Server-side storage in a new `message_reactions` Supabase table.

**Rationale**: Reactions are public (visible to all users). They must persist across sessions and sync in real time. The existing Supabase infrastructure already handles real-time broadcasting via `postgres_changes`. A dedicated reactions table with a UNIQUE constraint on (message_id, user_session_id) enforces one-reaction-per-user at the database level.

**Alternatives considered**:
- Embedding reaction counts in the messages table (simpler reads, but loses per-user tracking and can't show who reacted)
- JSONB column on messages (flexible but hard to enforce constraints, poor real-time granularity)

## R2: Pins Storage Strategy

**Decision**: Client-side storage in localStorage, keyed by conversation ID and session ID.

**Rationale**: Pins are personal and private — no other user should see them. The app uses anonymous sessions with no server-side user accounts. localStorage is the simplest approach that matches the existing session pattern (display name, session ID). Maximum 3 pins per conversation is enforced client-side.

**Alternatives considered**:
- IndexedDB (more structured but overkill for max 3 items per conversation)
- Server-side with session_id column (adds complexity, requires RLS policies, and pins would be lost when session expires anyway)

## R3: Real-Time Subscription Pattern for Reactions

**Decision**: Subscribe to INSERT/UPDATE/DELETE events on the `message_reactions` table, filtered by conversation_id. Maintain a local aggregated count map in React state.

**Rationale**: Follows the existing pattern from `use-messages.ts` — channel-based subscriptions with postgres_changes filtering. Subscribing at conversation scope (not per-message) avoids creating hundreds of channels. The client aggregates counts from the reaction records.

**Alternatives considered**:
- Subscribing per-message (too many channels for a busy conversation)
- Polling (violates Constitution Principle IV: Real-Time Is a Core Requirement)

## R4: Offline Reaction Handling

**Decision**: Queue pending reactions in a new `pending_reactions` IndexedDB object store. Sync on reconnect following the existing `pending_messages` pattern.

**Rationale**: The app is offline-first (feature 008). Reactions should follow the same optimistic-update + pending-queue pattern used for messages. On reconnect, pending reactions are replayed against the server.

**Alternatives considered**:
- Ignoring offline reactions (simpler but breaks the offline-first guarantee)
- localStorage queue (less structured than IndexedDB, which already handles pending operations)

## R5: Reaction UI Placement

**Decision**: Inline below each message bubble — small thumbs-up/down icons with counts. Only shown when a message has reactions or on hover/tap.

**Rationale**: Keeps the chat lightweight (FR-015: zero reactions = no clutter). Follows the existing minimal UI pattern. Icons are universally understood. Counts appear next to each icon.

**Alternatives considered**:
- Emoji picker with multiple reaction types (too complex for MVP, violates Principle III)
- Reactions in a separate panel (breaks the inline conversation flow)

## R6: Pinned Messages Section

**Decision**: A collapsible section at the top of the conversation panel showing compact previews (author + truncated body). Tapping scrolls to the original message.

**Rationale**: Pins need to be quickly accessible without taking too much vertical space. A compact preview gives enough context to identify the message. Scroll-to-original lets users see the full context.

**Alternatives considered**:
- Full message rendering in pin section (too much space, duplicated content)
- Sidebar for pins (no room on mobile, violates map-centric design)

## R7: Migration Numbering

**Decision**: New migration file as the next sequential number after existing migrations.

**Rationale**: The project uses numbered migrations in `supabase/migrations/`. The new table follows existing conventions (UUID PKs, TIMESTAMPTZ, CASCADE deletes, RLS policies for anon access).
