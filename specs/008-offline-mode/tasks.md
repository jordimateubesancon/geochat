# Tasks: Offline Mode

**Input**: Design documents from `/specs/008-offline-mode/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Install dependencies and create foundational files that all user stories depend on.

- [x] T001 Add `idb` dependency in package.json and run install
- [x] T002 [P] Create PWA web app manifest in src/app/manifest.ts (app name, icons, theme color, display: standalone)
- [x] T003 [P] Add Cache-Control headers for /sw.js in next.config.mjs
- [x] T004 [P] Add offline-related i18n keys to src/messages/en.json (offline indicator, pending message, create disabled, sync status)
- [x] T005 Add translations for new i18n keys to src/messages/es.json, src/messages/fr.json, src/messages/ca.json, and run `npm run i18n -- --sync`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core offline infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Create IndexedDB schema and CRUD helpers in src/lib/offline-db.ts — define database `geochat-offline` with 4 object stores (channels, conversations, messages, pending_messages) per data-model.md, export typed open/read/write/delete functions using `idb`
- [x] T007 Create online/offline detection hook in src/hooks/use-online-status.ts — use `navigator.onLine` + `online`/`offline` window events, return `{ isOnline: boolean }`
- [x] T008 Create service worker in public/sw.js — register fetch event listener with cache-first strategy for tile URLs matching `*.tile.opentopomap.org`, network-first for app shell assets (`/_next/static/**`), and passthrough for all other requests
- [x] T009 Register service worker from src/app/layout.tsx — add `useEffect` that calls `navigator.serviceWorker.register('/sw.js')` on mount (client-side only)

**Checkpoint**: Foundation ready — IndexedDB schema, online detection, and service worker are operational. User story implementation can now begin.

---

## Phase 3: User Story 1 — Browse Previously Viewed Conversations Offline (Priority: P1) 🎯 MVP

**Goal**: Users can open the app offline and see conversations and messages they previously viewed while online.

**Independent Test**: Load conversations while online, disable network in DevTools, reload — cached conversations and messages should appear on the map and be readable.

### Implementation for User Story 1

- [x] T010 [US1] Create write-through cache helper in src/hooks/use-offline-cache.ts — export functions `cacheChannels`, `cacheConversations`, `cacheMessages` that write Supabase response data to IndexedDB after each successful fetch
- [x] T011 [US1] Modify src/hooks/use-channels.ts — after successful Supabase fetch, call `cacheChannels()`; when `isOnline === false`, read channels from IndexedDB instead of Supabase
- [x] T012 [US1] Modify src/hooks/use-conversations.ts — after successful Supabase fetch, call `cacheConversations()`; when offline, query conversations from IndexedDB filtered by channel_id
- [x] T013 [US1] Modify src/hooks/use-messages.ts — after successful Supabase fetch, call `cacheMessages()`; when offline, read messages from IndexedDB by conversation_id
- [x] T014 [US1] Create offline indicator component in src/components/offline-indicator.tsx — small banner/chip that appears when `isOnline === false`, uses i18n key for label
- [x] T015 [US1] Add offline indicator to src/app/layout.tsx — render `<OfflineIndicator />` above or below the main content, visible on all pages

**Checkpoint**: User Story 1 complete. Users can browse cached conversations and messages offline with a visible offline indicator.

---

## Phase 4: User Story 2 — Map Tile Caching (Priority: P2)

**Goal**: Previously viewed map tiles render offline so users have spatial context.

**Independent Test**: Pan/zoom the map in an area while online, go offline, navigate to the same area — tiles should render from cache. Navigate to an unvisited area — grey placeholder should show.

### Implementation for User Story 2

- [x] T016 [US2] Enhance service worker tile caching in public/sw.js — add cache size tracking, implement LRU eviction when tile cache exceeds 50 MB (count entries, delete oldest by insertion order)
- [x] T017 [US2] Add placeholder tile handling in public/sw.js — when offline and tile is not cached, respond with a grey 256x256 PNG placeholder (inline base64 or generated via canvas in SW)
- [x] T018 [US2] Modify src/components/map-inner.tsx — add `errorTileUrl` prop to Leaflet TileLayer pointing to a grey placeholder, and set `crossOrigin=""` if needed for cache compatibility

**Checkpoint**: User Story 2 complete. Map tiles render offline for previously viewed areas; uncached areas show grey placeholders.

---

## Phase 5: User Story 3 — Queue Messages While Offline (Priority: P3)

**Goal**: Users can compose messages offline that auto-sync when connectivity returns.

**Independent Test**: Open a cached conversation offline, send a message — it appears with a "pending" badge. Restore connectivity — the message syncs and the badge disappears.

### Implementation for User Story 3

- [x] T019 [US3] Create pending message hook in src/hooks/use-pending-messages.ts — functions to add a pending message to IndexedDB, list pending messages for a conversation, update status (pending/sending/failed), delete on success
- [x] T020 [US3] Modify src/hooks/use-send-message.ts — when `isOnline === false`, write message to pending_messages store in IndexedDB instead of calling Supabase insert; add pending message to local message list with `pending` status
- [x] T021 [US3] Add sync-on-reconnect logic in src/hooks/use-pending-messages.ts — listen for `online` event, iterate pending_messages in chronological order, attempt Supabase insert for each, update status to `sending` then delete on success or set `failed` on error
- [x] T022 [US3] Modify src/components/message-list.tsx — render pending messages with a visual indicator (e.g., clock icon or muted style + "pending" label); render failed messages with error icon and retry button
- [x] T023 [US3] Modify src/components/create-dialog.tsx — when `isOnline === false`, disable the create button and show an i18n message explaining conversation creation requires connectivity
- [x] T024 [US3] Add retry action for failed messages in src/components/message-list.tsx — on retry click, reset message status to `pending` in IndexedDB and trigger sync

**Checkpoint**: User Story 3 complete. Messages can be composed offline, queued locally, and auto-synced on reconnect.

---

## Phase 6: User Story 4 — Connectivity Transition Handling (Priority: P4)

**Goal**: The app transitions smoothly between online and offline states without data loss.

**Independent Test**: Toggle airplane mode repeatedly while the app is open — offline indicator toggles, pending messages sync on reconnect, cached data refreshes with latest server data.

### Implementation for User Story 4

- [x] T025 [US4] Add cache refresh on reconnect in src/hooks/use-offline-cache.ts — when transitioning from offline to online, trigger a re-fetch of currently viewed channel/conversations to update stale cache
- [x] T026 [US4] Add stale cache cleanup in src/lib/offline-db.ts — export function to remove conversations/messages not seen in the last 30 days from IndexedDB
- [x] T027 [US4] Handle mid-composition connectivity loss in src/hooks/use-send-message.ts — if Supabase insert fails due to network error, automatically fall back to pending message queue instead of showing a hard error

**Checkpoint**: User Story 4 complete. App handles connectivity transitions gracefully with auto-sync and cache refresh.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that span multiple user stories.

- [ ] T028 [P] Add PWA icons — create 192x192 and 512x512 app icons in public/icons/ and reference them in src/app/manifest.ts
- [x] T029 [P] Add `apple-mobile-web-app-capable` and `apple-mobile-web-app-status-bar-style` meta tags in src/app/layout.tsx for iOS PWA support
- [x] T030 Run `npm run i18n` to verify all offline-related translation keys are present in all locales
- [ ] T031 Manual QA — follow quickstart.md testing workflow: browse online, go offline, verify cached data, compose messages, restore connectivity, verify sync
- [x] T032 Run `npm run build` to verify no TypeScript errors or build failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phases 3–6)**: All depend on Phase 2 completion
  - US1 (Phase 3): No dependency on other stories
  - US2 (Phase 4): No dependency on other stories (SW tile caching is independent)
  - US3 (Phase 5): Depends on US1 (needs cached conversations to display pending messages against)
  - US4 (Phase 6): Depends on US1 + US3 (needs cache infrastructure + pending message queue)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation)
                      ↓
              ┌───────┼───────┐
              ↓       ↓       ↓
           US1(P1)  US2(P2)  ...
              ↓
           US3(P3) ←──────────┘
              ↓
           US4(P4)
              ↓
         Phase 7 (Polish)
```

- **US1 + US2**: Can run in parallel after Phase 2
- **US3**: Requires US1 (needs write-through cache + offline read-through)
- **US4**: Requires US1 + US3 (needs both cache refresh and pending sync)

### Parallel Opportunities

- **Phase 1**: T002, T003, T004 can run in parallel
- **Phase 2**: T006 must complete first; T007, T008 can run in parallel after T006
- **Phases 3 + 4**: US1 and US2 can run in parallel
- **Phase 7**: T028, T029 can run in parallel

---

## Parallel Example: Phase 2 (Foundation)

```
Sequential: T006 (IndexedDB schema)
Then parallel:
  Agent A: T007 (online status hook)
  Agent B: T008 (service worker)
Then: T009 (register SW in layout)
```

## Parallel Example: US1 + US2

```
After Phase 2:
  Agent A: T010 → T011 → T012 → T013 → T014 → T015 (US1)
  Agent B: T016 → T017 → T018 (US2)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundation (T006–T009)
3. Complete Phase 3: User Story 1 (T010–T015)
4. **STOP and VALIDATE**: Test offline browsing independently
5. Deploy — users can already browse cached data offline

### Incremental Delivery

1. Setup + Foundation → Foundation ready
2. Add US1 → Cached conversations offline → Deploy (MVP!)
3. Add US2 → Map tiles offline → Deploy
4. Add US3 → Message queuing offline → Deploy
5. Add US4 → Smooth transitions → Deploy
6. Polish → PWA icons, iOS support, QA → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable (except US3→US1 and US4→US1+US3 dependencies)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
