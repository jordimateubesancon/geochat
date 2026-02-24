# Tasks: GeoChat MVP

**Input**: Design documents from `/specs/001-geochat-mvp/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No automated tests for V1 (manual testing only per plan.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization, dependencies, and base structure

- [x] T001 Initialize Next.js 14 project with App Router, TypeScript strict mode, and Tailwind CSS in the repository root
- [x] T002 Install dependencies: `react-leaflet@4`, `leaflet`, `@types/leaflet`, `leaflet-defaulticon-compatibility`, `@supabase/supabase-js`
- [x] T003 Configure Tailwind CSS for dark-only theme with `darkMode: 'class'` in `tailwind.config.ts`
- [x] T004 [P] Create TypeScript type definitions for Conversation, Message, and UserSession in `src/types/index.ts`
- [x] T005 [P] Create Supabase client initialization in `src/lib/supabase.ts` reading from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables
- [x] T006 [P] Create `.env.local.example` with placeholder Supabase environment variables
- [x] T007 Create root layout in `src/app/layout.tsx` with dark theme class on `<html>`, metadata (title: "GeoChat"), and global Tailwind styles

---

## Phase 2: Foundational (Database Migrations)

**Purpose**: Database schema and functions that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create migration `supabase/migrations/001_enable_postgis.sql` — enable PostGIS extension
- [x] T009 Create migration `supabase/migrations/002_create_conversations.sql` — conversations table with columns: id (UUID PK), title (TEXT), location (GEOGRAPHY(Point,4326)), latitude (DOUBLE PRECISION), longitude (DOUBLE PRECISION), creator_name (TEXT), message_count (INTEGER DEFAULT 0), last_message_at (TIMESTAMPTZ), created_at (TIMESTAMPTZ DEFAULT now()); GiST index on location; B-tree index on created_at
- [x] T010 Create migration `supabase/migrations/003_create_messages.sql` — messages table with columns: id (UUID PK), conversation_id (UUID FK → conversations.id), author_name (TEXT), body (TEXT), created_at (TIMESTAMPTZ DEFAULT now()); composite index on (conversation_id, created_at DESC)
- [x] T011 Create migration `supabase/migrations/004_create_rpc_functions.sql` — three RPC functions: `conversations_in_bounds(min_lng, min_lat, max_lng, max_lat)` using ST_MakeEnvelope; `conversations_nearby(lng, lat, radius_meters DEFAULT 1000)` using ST_DWithin; `messages_for_conversation(conv_id, page_size DEFAULT 50, before_timestamp TIMESTAMPTZ DEFAULT NULL)` with cursor-based pagination
- [x] T012 Create migration `supabase/migrations/005_create_triggers.sql` — trigger `update_conversation_stats` AFTER INSERT on messages that increments `message_count` and sets `last_message_at` on the parent conversation; also a trigger on conversations INSERT that populates `location` from `latitude` and `longitude`
- [x] T013 Create migration `supabase/migrations/006_enable_rls.sql` — enable RLS on both tables; policies: allow all SELECT and INSERT on conversations and messages for V1

**Checkpoint**: Database ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Discover Conversations on the Map (Priority: P1) MVP

**Goal**: User opens the app and sees a full-screen interactive map with conversation markers showing activity level. Markers update in real-time as new conversations are created.

**Independent Test**: Open the app. Verify map loads full-screen with dark tiles. Pan and zoom. If conversations exist in the database, markers appear at their coordinates showing message count and last activity time. Open a second tab, insert a conversation via Supabase dashboard, and verify the marker appears on the first tab within 2 seconds.

### Implementation for User Story 1

- [x] T014 [P] [US1] Create map wrapper client component in `src/components/map.tsx` — marks `"use client"`, uses `next/dynamic` to import map-inner with `ssr: false` and a dark loading placeholder
- [x] T015 [P] [US1] Create `useMapViewport` hook in `src/hooks/use-map-viewport.ts` — tracks current map bounds (min_lng, min_lat, max_lng, max_lat), debounces updates (300ms) on map `moveend` event, exposes bounds and a `refreshBounds` callback
- [x] T016 [US1] Create `useConversations` hook in `src/hooks/use-conversations.ts` — calls `supabase.rpc('conversations_in_bounds', bounds)` when viewport bounds change; subscribes to Supabase Realtime `postgres_changes` on conversations table (INSERT and UPDATE events) on a `map-conversations` channel; merges realtime updates into state; cleans up subscription on unmount
- [x] T017 [US1] Create marker component in `src/components/marker.tsx` — renders a Leaflet marker at conversation coordinates with a custom popup/tooltip showing title, message count, and relative last activity time (e.g., "12 messages · 5 min ago"); accepts `onClick` callback
- [x] T018 [US1] Create map inner implementation in `src/components/map-inner.tsx` — renders `<MapContainer>` full-screen with CARTO Dark Matter `<TileLayer>` (URL: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`); requests geolocation on mount (center on user if granted, world view zoom 2 if denied); imports `leaflet-defaulticon-compatibility`; uses `useMapViewport` to track bounds; uses `useConversations` to fetch and display markers; renders empty-state hint text (FR-016) when no conversations exist and no panel is open
- [x] T019 [US1] Create main page in `src/app/page.tsx` — server component that renders the Map wrapper component full-screen

**Checkpoint**: Map loads with conversation markers. Real-time marker updates work. This is the first testable increment.

---

## Phase 4: User Story 2 — Start a Conversation at a Location (Priority: P1)

**Goal**: User clicks the map to create a new conversation. If nearby conversations exist within 1 km, a warning is shown first. After creation, the marker appears on all users' maps in real-time.

**Independent Test**: Click an empty area on the map. If no nearby conversations, the create dialog appears. Fill in title and message, submit. Marker appears. In a second tab, verify the marker appears automatically. Click within 1 km of that conversation — verify the proximity warning appears listing the nearby conversation.

### Implementation for User Story 2

- [x] T020 [P] [US2] Create `useCreateConversation` hook in `src/hooks/use-create-conversation.ts` — accepts lat/lng; calls `supabase.rpc('conversations_nearby', {lng, lat, radius_meters: 1000})` to check proximity; if nearby results exist, returns them for warning display; on confirmed creation, inserts into conversations table (client-generated UUID, title, latitude, longitude, creator_name from session, initial message_count: 1, last_message_at: now) and inserts the first message into messages table; returns conversation ID on success
- [x] T021 [P] [US2] Create nearby warning component in `src/components/nearby-warning.tsx` — modal overlay listing nearby conversations (title, distance, message count); each conversation is clickable to open it; includes a "Create anyway" button to proceed and a "Cancel" button; focus trap and Escape to close
- [x] T022 [US2] Create create dialog component in `src/components/create-dialog.tsx` — centered modal overlay showing selected coordinates (read-only), title input (required, max 120 chars with counter), message textarea (required, max 2000 chars with counter), Cancel and Create buttons; Enter in message field submits (FR-018); Escape closes; form validation prevents empty submission (FR-005); focus trap (AR-002)
- [x] T023 [US2] Integrate map click handler in `src/components/map-inner.tsx` — on map click (empty area), capture lat/lng; call `useCreateConversation` proximity check; if nearby conversations found, show NearbyWarning; if none (or user proceeds), show CreateDialog; on successful creation, add marker to map and open conversation panel

**Checkpoint**: Full create flow works including proximity warning. New conversations appear on other users' maps in real-time.

---

## Phase 5: User Story 3 — Join and Participate in a Conversation (Priority: P1)

**Goal**: User clicks a marker to open a side panel with conversation details and messages. They can send messages with optimistic updates. Messages sync in real-time between users.

**Independent Test**: Click a conversation marker. Panel opens showing title, location, creator, time, and messages. Send a message — it appears instantly. Open same conversation in second tab — verify messages sync both ways within 2 seconds. Close panel and verify map returns to full view.

### Implementation for User Story 3

- [x] T024 [P] [US3] Create `useMessages` hook in `src/hooks/use-messages.ts` — calls `supabase.rpc('messages_for_conversation', {conv_id, page_size: 50})` for initial load; supports cursor-based pagination via `before_timestamp` parameter for scroll-up loading of older messages; subscribes to Supabase Realtime `postgres_changes` on messages table filtered by `conversation_id`; deduplicates incoming realtime messages against optimistic entries by matching on `id`; cleans up subscription on unmount
- [x] T025 [P] [US3] Create `useSendMessage` hook in `src/hooks/use-send-message.ts` — generates client-side UUID; appends optimistic message to local state with `status: 'sending'`; calls `supabase.from('messages').insert({id, conversation_id, author_name, body})`; on error, marks message as `status: 'failed'` and shows error notification; uses session_id to identify own messages for visual distinction (FR-008)
- [x] T026 [P] [US3] Create message input component in `src/components/message-input.tsx` — text input with send button; Enter sends message (FR-018); Shift+Enter inserts newline (FR-019); disables send button when input is empty; ARIA label on input and button (AR-003)
- [x] T027 [US3] Create message list component in `src/components/message-list.tsx` — scrollable container showing messages in chronological order (oldest at top, newest at bottom); each message shows author name, body, and relative timestamp; user's own messages visually distinguished with different alignment/color (FR-008); auto-scrolls to bottom on new messages; detects scroll-to-top to trigger older message loading via `useMessages` pagination; shows loading indicator while fetching older messages
- [x] T028 [US3] Create conversation panel component in `src/components/conversation-panel.tsx` — slides in from right side of screen; header shows conversation title, coordinates, creator name, and relative creation time; body contains MessageList; footer contains MessageInput; close button in header; clicking outside panel closes it (FR-017); focus trap on open, returns focus to trigger marker on close (AR-002); ARIA labels (AR-003)
- [x] T029 [US3] Integrate marker click and panel state in `src/components/map-inner.tsx` — on marker click, set selected conversation in state and open ConversationPanel; pass conversation data and close handler; only one panel open at a time

**Checkpoint**: Full conversation loop works — discover, create, join, chat in real-time. All P1 stories are complete. This is the MVP.

---

## Phase 6: User Story 4 — Anonymous Participation (Priority: P2)

**Goal**: User gets an automatically assigned display name on first visit, persisted in browser storage. Name appears in the top bar and on all messages/conversations they create.

**Independent Test**: Open the app — verify a display name appears in the top bar. Send a message — verify the name appears on it. Close and reopen browser — verify same name. Open in a different browser — verify a different name is assigned.

### Implementation for User Story 4

- [ ] T030 [US4] Create `useUserSession` hook in `src/hooks/use-user-session.ts` — on mount, checks `localStorage` for existing `display_name` and `session_id`; if not found, generates a random display name (two-word format, e.g., "BlueFox", "RedOwl") and a UUID session_id, stores both in localStorage; returns `{displayName, sessionId}`; handles SSR safety (check `typeof window !== 'undefined'` before accessing localStorage)
- [ ] T031 [US4] Create top bar component in `src/components/top-bar.tsx` — fixed position at top of screen over the map; shows "GeoChat" app name on the left and the user's display name on the right; dark theme styling with semi-transparent background so map is visible behind; z-index above map but below modals; ARIA label (AR-003)
- [ ] T032 [US4] Wire user session into map-inner, create-dialog, and send-message — in `src/components/map-inner.tsx` render TopBar and pass displayName; in create-dialog pass displayName as creator_name; in useSendMessage pass displayName as author_name and sessionId for own-message detection

**Checkpoint**: Anonymous identity system complete. Display names appear everywhere consistently.

---

## Phase 7: User Story 5 — Responsive Mobile Experience (Priority: P3)

**Goal**: App is usable on mobile browsers down to 375px width. Conversation panel goes full-width on small screens. Create dialog adapts without horizontal scrolling.

**Independent Test**: Resize browser to 375px width (or use mobile device). Verify map fills screen. Click a marker — panel takes full width. Open create dialog — no horizontal scrolling. Pan and zoom with touch gestures work.

### Implementation for User Story 5

- [ ] T033 [P] [US5] Add responsive styles to conversation panel in `src/components/conversation-panel.tsx` — below 768px breakpoint, panel takes full screen width instead of side panel; close button remains accessible; smooth transition between layouts
- [ ] T034 [P] [US5] Add responsive styles to create dialog in `src/components/create-dialog.tsx` — on screens below 768px, dialog takes full width with appropriate padding; all fields visible without horizontal scrolling; buttons stack vertically if needed
- [ ] T035 [P] [US5] Add responsive styles to nearby warning in `src/components/nearby-warning.tsx` — on screens below 768px, warning dialog takes full width; conversation list remains scrollable and tappable
- [ ] T036 [US5] Verify touch interactions on map in `src/components/map-inner.tsx` — ensure Leaflet touch handlers are enabled (pinch-to-zoom, drag-to-pan); adjust tap targets for markers to be at least 44x44px on mobile; ensure top bar does not interfere with map gestures

**Checkpoint**: App is fully usable on mobile browsers. All previous stories still work at 375px width.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, error handling, and final quality improvements across all stories

- [ ] T037 [P] Add keyboard navigation support to the map in `src/components/map-inner.tsx` — ensure map is focusable and navigable with arrow keys, +/- for zoom (AR-001); add `tabIndex` and ARIA role
- [ ] T038 [P] Add ARIA labels and roles to all interactive elements across `src/components/*.tsx` — verify every button, input, and interactive element has an appropriate `aria-label` or `aria-labelledby` (AR-003)
- [ ] T039 [P] Verify color contrast in dark theme across all components — ensure all text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text) against the dark backgrounds (AR-004)
- [ ] T040 Add toast notification system for error messages in `src/components/map-inner.tsx` or a new `src/components/toast.tsx` — non-intrusive notification for failed message sends (FR-010), network disconnection, and reconnection events; auto-dismiss after 5 seconds; positioned to not overlap map controls
- [ ] T041 Add Supabase Realtime reconnection handling in `src/hooks/use-conversations.ts` and `src/hooks/use-messages.ts` — detect channel disconnection; show toast notification; attempt automatic reconnection; refetch data on reconnect to catch up on missed events
- [ ] T042 Run quickstart.md validation — follow every step in `specs/001-geochat-mvp/quickstart.md` to verify the setup guide is accurate and complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001-T002 (project initialized). BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 3 (needs map + markers)
- **User Story 3 (Phase 5)**: Depends on Phase 4 (needs conversations to exist)
- **User Story 4 (Phase 6)**: Can start after Phase 2, but best after Phase 3 to wire in display names
- **User Story 5 (Phase 7)**: Depends on Phases 3-5 (needs all components to exist before making responsive)
- **Polish (Phase 8)**: Depends on all user stories being complete

### Within Each User Story

- Hooks before components that use them
- Components before integration tasks
- All [P] tasks within a phase can run in parallel

### Parallel Opportunities

```text
Phase 1:  T004 ─┐
          T005 ─┤ All parallel (different files)
          T006 ─┘

Phase 2:  T008 → T009 ─┐
                 T010 ─┘→ T011 → T012 → T013
                          (sequential: tables before functions before triggers before RLS)

Phase 3:  T014 ─┐
          T015 ─┤ Parallel (different files)
                └→ T016 → T017 → T018 → T019
                   (useConversations needs viewport; marker needs conversations; map-inner integrates all)

Phase 4:  T020 ─┐
          T021 ─┤ Parallel (different files)
                └→ T022 → T023
                   (dialog after hook+warning; integration last)

Phase 5:  T024 ─┐
          T025 ─┤ Parallel (different files)
          T026 ─┘→ T027 → T028 → T029
                   (message list needs hooks+input; panel needs list; integration last)

Phase 7:  T033 ─┐
          T034 ─┤ All parallel (different components)
          T035 ─┘→ T036

Phase 8:  T037 ─┐
          T038 ─┤ All parallel (independent concerns)
          T039 ─┘→ T040 → T041 → T042
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (database)
3. Complete Phase 3: User Story 1 (discover) — first testable increment
4. Complete Phase 4: User Story 2 (create)
5. Complete Phase 5: User Story 3 (participate)
6. **STOP and VALIDATE**: The core loop works — discover, create, participate in real-time conversations on a map

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 → Map with markers works (demo: "look at conversations on a map")
3. Add US2 → Create conversations works (demo: "click to start a conversation")
4. Add US3 → Full chat works (demo: "real-time conversation between two users")
5. Add US4 → Identity works (demo: "every user has a unique name")
6. Add US5 → Mobile works (demo: "use it on your phone")
7. Polish → Production quality

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No automated tests in V1 — all testing is manual per plan.md
