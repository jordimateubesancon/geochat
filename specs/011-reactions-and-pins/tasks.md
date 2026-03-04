# Tasks: Message Reactions & Personal Pins

**Input**: Design documents from `/specs/011-reactions-and-pins/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Not requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema and shared types needed by all user stories

- [x] T001 Create migration for message_reactions table with UNIQUE constraint, indexes, RLS policies, and realtime in supabase/migrations/008_add_reactions.sql
- [x] T002 Add Reaction and PinnedMessage TypeScript interfaces to src/types/index.ts
- [x] T003 [P] Add i18n keys for reactions and pins to src/messages/en.json (reactions.thumbsUp, reactions.thumbsDown, reactions.viewReactors, pins.pin, pins.unpin, pins.maxReached, pins.pinnedMessages)
- [x] T004 [P] Add pending_reactions object store (with conversation_id and status indexes) to IndexedDB schema in src/lib/offline-db.ts (bump DB version)

**Checkpoint**: Schema, types, and i18n keys ready for feature implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hooks that user story UI components depend on

**⚠️ CRITICAL**: No user story UI work can begin until this phase is complete

- [x] T005 Create useReactions hook in src/hooks/use-reactions.ts — fetch reactions for a conversation from Supabase, subscribe to realtime INSERT/UPDATE/DELETE on message_reactions filtered by conversation_id, maintain aggregated counts + user's own reaction per message in React state, expose toggleReaction(messageId, reactionType) with optimistic updates, queue pending reactions to IndexedDB when offline, sync pending on reconnect
- [x] T006 [P] Create usePins hook in src/hooks/use-pins.ts — read/write pins from localStorage under key geochat_pins, expose pinMessage(conversationId, message)/unpinMessage(conversationId, messageId)/getPins(conversationId), enforce max 3 per conversation limit, return pins array for a given conversation, auto-remove pins for deleted messages when message list updates

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — React to a Message (Priority: P1) 🎯 MVP

**Goal**: Users can tap thumbs-up/thumbs-down on any message, see aggregate counts, and receive real-time updates from other users.

**Independent Test**: Open a conversation, tap thumbs-up on a message → count shows 1 with icon highlighted. Open same conversation in a second tab → count visible there too. Tap again → reaction removed, count returns to 0.

### Implementation for User Story 1

- [x] T007 [US1] Create ReactionButtons component in src/components/reaction-buttons.tsx — render inline thumbs-up and thumbs-down icons below a message bubble, show count next to each icon (hide if zero per FR-015), highlight the user's active reaction (FR-003), call toggleReaction on tap, support toggle-off (FR-004) and switch (FR-005) via the hook
- [x] T008 [US1] Integrate ReactionButtons into message rendering in src/components/message-list.tsx — import useReactions, pass reaction data and toggleReaction to ReactionButtons for each message, ensure reactions render below both own and others' message bubbles
- [x] T009 [US1] Add translations for reaction keys in src/messages/es.json, src/messages/fr.json, and src/messages/ca.json
- [x] T010 [US1] Verify real-time sync: apply migration 008 to Supabase, enable realtime on message_reactions table in Supabase dashboard, test that reactions from one browser tab appear in another within 2 seconds

**Checkpoint**: User Story 1 fully functional — reactions work with real-time sync

---

## Phase 4: User Story 2 — Pin a Message for Personal Reference (Priority: P2)

**Goal**: Users can pin up to 3 messages per conversation. Pinned messages appear at the top of the chat with a compact preview. Pins are private and persist across page refreshes.

**Independent Test**: Pin a message → it appears in the pinned section at top. Pin 3 messages → try a 4th, see limit warning. Tap a pinned preview → chat scrolls to original message. Close and reopen conversation → pins still visible. Open in incognito → no pins visible.

### Implementation for User Story 2

- [x] T011 [US2] Create PinnedMessages component in src/components/pinned-messages.tsx — render a compact section at the top of the chat showing pinned message previews (author name, truncated body up to 100 chars, timestamp), include unpin button on each preview, emit scroll-to-message callback when a preview is tapped, show pin count (e.g., "2/3 pinned")
- [x] T012 [US2] Add pin icon button to each message bubble in src/components/message-list.tsx — show pin/unpin icon per message using usePins, call pinMessage on tap, show toast with limit warning from FR-012 when max reached, add ref-based scroll-to-message support (assign refs to message elements by ID, expose scrollToMessage callback)
- [x] T013 [US2] Integrate PinnedMessages section into conversation panel in src/components/message-list.tsx — render PinnedMessages above the message scroll area, wire onScrollToMessage to scroll the chat to the target message element using refs, auto-remove stale pins when messages are no longer in the conversation
- [x] T014 [US2] Add translations for pin keys in src/messages/es.json, src/messages/fr.json, and src/messages/ca.json

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 — View Reaction Details (Priority: P3)

**Goal**: Users can tap a reaction count to see a popover listing display names of users who reacted (up to 10 names, "+N more" for larger counts).

**Independent Test**: React to a message from two different sessions → tap the count → see both display names in a popover.

### Implementation for User Story 3

- [x] T015 [US3] Extend useReactions hook in src/hooks/use-reactions.ts to expose a getReactorNames(messageId, reactionType) function that returns the list of user_name values for a given message and reaction type (fetched from the local reaction records already in state)
- [x] T016 [US3] Create ReactionPopover component in src/components/reaction-popover.tsx — small tooltip/popover triggered by tapping a reaction count, shows up to 10 display names with "+N more" suffix if exceeding, dismisses on outside click or tap
- [x] T017 [US3] Integrate ReactionPopover into ReactionButtons in src/components/reaction-buttons.tsx — wire count tap to show the popover, pass reactor names from getReactorNames
- [x] T018 [US3] Add translations for reactor popover keys in src/messages/es.json, src/messages/fr.json, and src/messages/ca.json

**Checkpoint**: All user stories independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T019 [P] Run npm run i18n -- --sync to update translation tracking in src/messages/.tracking.json
- [x] T020 [P] Run npm run lint && npm run build to verify no errors
- [x] T021 Run quickstart.md validation — follow all verification steps from specs/011-reactions-and-pins/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001, T002, T004) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 — no dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Phase 2 — no dependencies on other stories
- **User Story 3 (Phase 5)**: Depends on Phase 2 AND Phase 3 (extends useReactions from US1)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — fully independent
- **User Story 2 (P2)**: Can start after Phase 2 — fully independent, can run in parallel with US1
- **User Story 3 (P3)**: Depends on US1 (extends the useReactions hook and ReactionButtons component)

### Within Each User Story

- Hook/data layer before UI components
- Components before integration into message-list
- Translations can be done in parallel with components

### Parallel Opportunities

- T003 and T004 can run in parallel (different files)
- T005 and T006 can run in parallel (different files, different storage backends)
- US1 and US2 can run in parallel after Phase 2 (different hooks, different components)
- Translation tasks within each story can be parallelized with implementation

---

## Parallel Example: User Story 1

```bash
# After Phase 2 is complete, launch US1 tasks:
# T007 can start immediately (depends only on T005 hook)
# T009 can run in parallel with T007 (different files — i18n vs component)

# Sequential:
# T008 depends on T007 (integrates ReactionButtons into message-list)
# T010 depends on T008 (end-to-end verification)
```

## Parallel Example: User Story 2

```bash
# After Phase 2 is complete, launch US2 tasks:
# T011 can start immediately (depends only on T006 hook)
# T014 can run in parallel with T011 (different files — i18n vs component)

# Sequential:
# T012 depends on T011 (adds pin icon to message bubbles)
# T013 depends on T011 and T012 (integrates PinnedMessages section)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T006)
3. Complete Phase 3: User Story 1 (T007–T010)
4. **STOP and VALIDATE**: Test reactions independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US1 and US2 are fully independent and can be developed in parallel
- US3 depends on US1's hook and component, so implement after US1
