# Tasks: Topic Channels

**Input**: Design documents from `/specs/005-topic-channels/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Type definitions and database migration — shared foundation for all stories

- [x] T001 Add Channel interface and update Conversation interface with channel_id in src/types/index.ts
- [x] T002 Create database migration: channels table, seed data, channel_id FK on conversations, assign existing conversations to "General" channel, RLS policies, indexes — in supabase/migrations/007_add_channels.sql
- [x] T003 Update conversations_in_bounds RPC to accept and filter by p_channel_id parameter in supabase/migrations/007_add_channels.sql
- [x] T004 Update conversations_nearby RPC to accept and filter by p_channel_id parameter in supabase/migrations/007_add_channels.sql

**Checkpoint**: Database ready — channels table exists, conversations have channel_id, RPCs accept channel filter

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hook for fetching channels — needed by US1 (channel selection) and US4 (channel info)

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create useChannels hook to fetch all active channels with conversation counts, ordered by sort_order in src/hooks/use-channels.ts

**Checkpoint**: Foundation ready — channel data is fetchable from the client

---

## Phase 3: User Story 1 - Browse and Select a Channel (Priority: P1) MVP

**Goal**: Users see a channel selection screen on app launch and can select a channel to view the map filtered to that channel's conversations.

**Independent Test**: Open the app at `/`, see channel cards, click "Skimo", verify the map at `/channel/skimo` loads with only Skimo conversations.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create ChannelCard component displaying channel name, icon, description, and conversation count in src/components/channel-card.tsx
- [x] T007 [P] [US1] Create ChannelGrid component rendering a responsive grid of ChannelCard items with loading and empty states in src/components/channel-grid.tsx
- [x] T008 [US1] Replace current map entry point with channel selection page using ChannelGrid in src/app/page.tsx
- [x] T009 [US1] Create dynamic route page that resolves channel by slug and renders the Map component with channelId prop in src/app/channel/[slug]/page.tsx
- [x] T010 [US1] Update MapInner to accept channelId prop and pass it to useConversations and useCreateConversation hooks in src/components/map-inner.tsx
- [x] T011 [US1] Update Map wrapper component to accept and forward channelId prop in src/components/map.tsx
- [x] T012 [US1] Update useConversations hook to pass channel_id (p_channel_id) to conversations_in_bounds RPC and filter realtime subscription by channel_id in src/hooks/use-conversations.ts

**Checkpoint**: User Story 1 fully functional — channel selection gates the map, conversations filtered by channel

---

## Phase 4: User Story 2 - Switch Between Channels (Priority: P2)

**Goal**: Users can navigate back from the map to the channel selection screen and choose a different channel.

**Independent Test**: Enter "Skimo" channel, click back/channel name in the top bar, return to channel selection, select "Rock Climbing", verify map shows only Rock Climbing conversations.

### Implementation for User Story 2

- [x] T013 [US2] Update TopBar to display active channel name and a back link to the channel selection page (/) in src/components/top-bar.tsx

**Checkpoint**: User Story 2 complete — channel switching works via top bar navigation. Browser back button works natively via URL routing.

---

## Phase 5: User Story 3 - Create Conversation in Channel (Priority: P2)

**Goal**: New conversations are automatically associated with the currently active channel.

**Independent Test**: Enter "Skimo" channel, create a new conversation on the map, switch to "Rock Climbing" channel, verify the new conversation does not appear.

### Implementation for User Story 3

- [x] T014 [US3] Update useCreateConversation hook to accept channelId and include channel_id in the conversation INSERT, and pass p_channel_id to conversations_nearby RPC in src/hooks/use-create-conversation.ts
- [x] T015 [US3] Update CreateDialog — no changes needed; channelId flows through MapInner → useCreateConversation hook

**Checkpoint**: User Story 3 complete — new conversations are tagged with the active channel

---

## Phase 6: User Story 4 - View Channel Information (Priority: P3)

**Goal**: Each channel card shows name, description, icon, and conversation count to help users choose.

**Independent Test**: View channel selection screen, verify each card shows name, description, emoji icon, and a conversation count (including 0 for empty channels).

### Implementation for User Story 4

> This story is already delivered by T005 (useChannels with counts), T006 (ChannelCard), and T007 (ChannelGrid) from earlier phases. No additional tasks needed — mark as complete when Phase 3 checkpoint passes.

**Checkpoint**: User Story 4 inherently complete from US1 implementation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, search scoping, and final integration

- [x] T016 [P] Update useConversationSearch hook to accept and filter by channelId when searching chat titles from the map view in src/hooks/use-conversation-search.ts
- [x] T017 [P] Add error handling for invalid channel slug in src/app/channel/[slug]/page.tsx — redirect to / if channel not found
- [x] T018 Add empty state for channel selection page when no channels exist in src/components/channel-grid.tsx
- [x] T019 Run quickstart.md validation — TypeScript compiles, ESLint passes, Next.js build succeeds with correct routes (/ static, /channel/[slug] dynamic)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 (types) from Setup
- **US1 (Phase 3)**: Depends on Phase 2 (T005 useChannels hook)
- **US2 (Phase 4)**: Depends on Phase 3 (T009 channel page exists, T010 channelId flows through)
- **US3 (Phase 5)**: Depends on Phase 3 (T010 channelId prop available in MapInner)
- **US4 (Phase 6)**: No additional tasks — delivered by US1 implementation
- **Polish (Phase 7)**: Depends on US1 + US3 completion

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — **this is the MVP**
- **US2 (P2)**: Depends on US1 (needs channel page + top bar to exist)
- **US3 (P2)**: Depends on US1 (needs channelId flowing through MapInner)
- **US4 (P3)**: No additional work — delivered by US1

### Within Each User Story

- Types/models before hooks
- Hooks before components
- Components before pages
- Pages complete the story

### Parallel Opportunities

- T001 and T002-T004 can run in parallel (types vs migration — different files)
- T006 and T007 can run in parallel (independent components)
- T016 and T017 can run in parallel (different files, no dependencies)
- US2 and US3 can run in parallel after US1 completes (different files)

---

## Parallel Example: User Story 1

```bash
# After Phase 2 completes, launch parallel component creation:
Task: "Create ChannelCard component in src/components/channel-card.tsx"      # T006
Task: "Create ChannelGrid component in src/components/channel-grid.tsx"      # T007

# Then sequential page wiring:
Task: "Replace entry point with channel selection in src/app/page.tsx"       # T008
Task: "Create channel route page in src/app/channel/[slug]/page.tsx"         # T009
Task: "Update MapInner with channelId prop in src/components/map-inner.tsx"  # T010
Task: "Update Map wrapper in src/components/map.tsx"                          # T011
Task: "Update useConversations with channel filter in src/hooks/use-conversations.ts"  # T012
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004) — types + migration
2. Complete Phase 2: Foundational (T005) — useChannels hook
3. Complete Phase 3: User Story 1 (T006–T012) — channel selection + filtered map
4. **STOP and VALIDATE**: Open app → see channels → select one → map filters correctly
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Database and types ready
2. Add US1 → Channel selection + filtered map → **MVP!**
3. Add US2 → Channel switching via top bar (T013)
4. Add US3 → New conversations tagged with channel (T014–T015)
5. Add US4 → Already delivered by US1
6. Polish → Search scoping, error handling, edge cases (T016–T019)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US4 requires no dedicated tasks — it's satisfied by US1's ChannelCard + useChannels implementation
- Migration (T002–T004) should be a single SQL file with all changes
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
