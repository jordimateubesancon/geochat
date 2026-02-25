# Research: Chat Title Search with Dual Search Mode

**Feature Branch**: `004-chat-title-search`
**Date**: 2026-02-25

## R1: Chat Title Query Approach

**Decision**: Use Supabase client `.ilike()` filter directly from the client, not a custom RPC function.

**Rationale**:
- The `conversations` table already exists with a `title` column.
- Supabase's `.ilike()` maps to PostgreSQL `ILIKE` which provides case-insensitive partial matching — exactly what FR-006 requires.
- Query: `supabase.from("conversations").select("*").ilike("title", `%${query}%`).limit(10).order("created_at", { ascending: false })`
- No server-side function needed for a simple filter query. Keeps it simple (Constitution Principle III).

**Alternatives considered**:
- **Custom RPC function** (`search_conversations`): Would require a SQL migration for a trivial ILIKE query. Over-engineering. Rejected.
- **Full-text search** (`to_tsvector`/`to_tsquery`): More powerful but overkill for searching short titles. Would require a new index and migration. Rejected per Principle III.

## R2: Search Mode State Management

**Decision**: Lift the search mode state ("places" | "chats") into the `location-search.tsx` component. Both hooks (`useNominatimSearch` and `useConversationSearch`) are instantiated but only the active one receives query updates.

**Rationale**:
- Both hooks follow the same interface: `{ query, setQuery, results, loading, error }`.
- The component controls which hook's `setQuery` is called based on the active mode.
- When mode switches, the inactive hook's query is cleared, triggering its cleanup.
- This keeps each hook independent and testable.

**Alternatives considered**:
- **Single unified hook**: Would combine two different data sources into one hook, making it harder to maintain. Rejected.
- **Mode state in map-inner.tsx**: Unnecessary — the mode is internal to the search UI. Rejected (keep state as local as possible).

## R3: Segmented Toggle Design

**Decision**: A two-segment pill toggle built with Tailwind utility classes, placed directly above the search input inside the existing search component.

**Rationale**:
- Segmented controls are a well-understood UI pattern for binary choices.
- The active segment gets a filled background; the inactive segment is transparent.
- No external UI library needed — simple `flex` + `rounded-full` + conditional classes.
- Matches the existing Tailwind-only styling approach in the project.

**Alternatives considered**:
- **Dropdown/select**: Less discoverable — users may not realize a second mode exists. Rejected.
- **Tabs**: Heavier visual weight for only 2 options. Rejected.
- **Icon toggle**: Less clear what each mode does without labels. Rejected.

## R4: Conversation Selection from Search

**Decision**: Pass a new `onSelectConversation` callback from `map-inner.tsx` to the search component. When a chat result is selected, this callback sets `selectedConversation` and flies the map to the coordinates.

**Rationale**:
- Reuses the exact same `setSelectedConversation` and `mapRef.current.flyTo()` patterns already in `map-inner.tsx`.
- The search component doesn't need to know about the map — it just calls `onSelectConversation(conversation)`.
- On mobile, selecting a conversation already closes the toolbox (existing behavior from 003).

**Alternatives considered**:
- **Event bus / context**: Over-engineering for passing one callback. Rejected.
- **Search component directly accessing map**: Would break component isolation. Rejected.

## R5: Cancellation for Supabase Queries

**Decision**: Use Supabase's `AbortController` support via the `signal` option on `.select()` calls, mirroring the Nominatim hook pattern.

**Rationale**:
- Supabase JS client v2 supports passing `{ signal }` to abort in-flight requests.
- Prevents stale results from overwriting newer results during rapid typing.
- Consistent with the existing `useNominatimSearch` hook pattern.

**Alternatives considered**:
- **No cancellation, just ignore stale results**: Wastes bandwidth and could cause flicker. Rejected.
