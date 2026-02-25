# Tasks: Chat Title Search with Dual Search Mode

**Input**: Design documents from `/specs/004-chat-title-search/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No test framework configured. Tests are not included. Manual verification via quickstart.md checklist.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup needed — all types already exist (`Conversation` in `src/types/index.ts`)

_(No tasks — the existing `Conversation` type is already sufficient for chat search results)_

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the `useConversationSearch` hook — the core data-fetching logic for chat title search

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Create `src/hooks/use-conversation-search.ts` — implement `useConversationSearch` hook mirroring `useNominatimSearch` interface. Use `supabase.from("conversations").select("*").ilike("title", `%${query}%`).limit(10).order("created_at", { ascending: false })` with `{ signal }` from AbortController. 300ms debounce via `useEffect`/`setTimeout`, minimum 2-character threshold. Return `{ query, setQuery, results, loading, error }`. Set error to `"Search is temporarily unavailable"` for Supabase errors. Silently ignore `AbortError`. Clear results and error when query drops below 2 characters.

**Checkpoint**: Hook ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Search Conversations by Title (Priority: P1) MVP

**Goal**: Users can search for conversations by title, see matching results, select one to fly the map there and open the conversation panel.

**Independent Test**: Switch to "Chats" mode, type a known conversation title, select a result, verify map flies to the location and conversation panel opens.

### Implementation for User Story 1

- [x] T002 [US1] Rename `onSelect` prop to `onSelectLocation` in `src/components/location-search.tsx` and add new `onSelectConversation` prop of type `(conversation: Conversation) => void`. Import `Conversation` type. Update the existing place-result handler to call `onSelectLocation`.
- [x] T003 [US1] Add chat search result rendering to `src/components/location-search.tsx` — when in "chats" mode and results are available, render a results list showing each conversation's `title` (bold) and `creator_name` (secondary text). On click, call `onSelectConversation(result)`. Clear the query after selection. Reuse the same `role="listbox"` / `role="option"` pattern and highlighted index state for keyboard navigation.
- [x] T004 [US1] Update `src/components/map-inner.tsx` — rename `handleLocationSelect` callback to `onSelectLocation` in the `<LocationSearch>` props. Add new `handleConversationSelect` callback that: receives a `Conversation`, calls `mapRef.current.flyTo([conversation.latitude, conversation.longitude], 15)`, calls `setSelectedConversation(conversation)`, and closes the toolbox on mobile. Pass both callbacks to `<LocationSearch>`.

**Checkpoint**: User Story 1 complete — users can search chats and navigate to them

---

## Phase 4: User Story 2 — Intuitive Toggle Between Search Modes (Priority: P2)

**Goal**: Users see a clear segmented pill toggle to switch between "Places" and "Chats" modes. Active mode is highlighted. Placeholder text updates.

**Independent Test**: Toggle between modes, verify active state highlights, placeholder changes, and results clear on switch.

### Implementation for User Story 2

- [x] T005 [US2] Add search mode state and toggle UI to `src/components/location-search.tsx` — add `mode` state of type `"places" | "chats"` (default `"places"`). Import and instantiate `useConversationSearch` alongside existing `useNominatimSearch`. Render a segmented pill toggle above the search input: two buttons inside a `flex rounded-full bg-neutral-100` container. Active button gets `bg-white shadow-sm text-neutral-900`, inactive gets `text-neutral-500`. Labels: "Places" and "Chats". On toggle: set mode, clear the inactive hook's query via `setQuery("")`, and reset `highlightedIndex` to -1.
- [x] T006 [US2] Wire mode to search behavior in `src/components/location-search.tsx` — based on `mode`, route `onChange` to the active hook's `setQuery`. Derive `results`, `loading`, `error` from the active hook. Update placeholder: `"City, address, or place..."` for places, `"Search conversations..."` for chats. Update minimum character threshold display logic: 3 for places, 2 for chats. Conditionally render place results (existing) or chat results (T003) based on mode. Update "No results found" message to "No conversations found" in chats mode.

**Checkpoint**: User Story 2 complete — users can intuitively toggle between search modes

---

## Phase 5: User Story 3 — Unified Search Experience (Priority: P3)

**Goal**: Both modes share identical keyboard navigation, loading indicator, and error feedback patterns.

**Independent Test**: Verify arrow keys, Enter, Escape, loading spinner, and error messages work identically in both modes.

### Implementation for User Story 3

- [x] T007 [US3] Unify keyboard navigation in `src/components/location-search.tsx` — ensure `handleKeyDown` works with the active mode's results array (either `NominatimResult[]` or `Conversation[]`). The arrow keys, Enter, and Escape handlers should reference a unified `activeResults` variable derived from the current mode's hook. Enter should call the appropriate handler (`handleSelectPlace` or `handleSelectConversation`) based on mode.
- [x] T008 [US3] Unify loading and error states in `src/components/location-search.tsx` — ensure the loading spinner, "No results" message, and error message are rendered from the active hook's state regardless of mode. The spinner, empty-state, and error components should be mode-agnostic (rendered once, not duplicated per mode).

**Checkpoint**: User Story 3 complete — consistent UX across both modes

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation

- [x] T009 [P] Run ESLint (`npm run lint`) and TypeScript check (`npx tsc --noEmit`) and fix any errors across all new and modified files
- [x] T010 Run full manual verification using `specs/004-chat-title-search/quickstart.md` checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — can start immediately
- **User Story 1 (Phase 3)**: Depends on Phase 2 (needs `useConversationSearch` hook)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (adds toggle to component already modified in US1)
- **User Story 3 (Phase 5)**: Depends on Phase 4 (unifies behavior across both modes from US2)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational phase — adds chat results + selection callback
- **User Story 2 (P2)**: Depends on US1 — adds the mode toggle and wires both hooks
- **User Story 3 (P3)**: Depends on US2 — unifies keyboard and state patterns across modes

### Within Each User Story

- US1: T002-T003 are sequential (same file), T004 depends on T002 (prop rename)
- US2: T005-T006 are sequential (same file, building on each other)
- US3: T007-T008 are sequential (same file, refining behavior)

### Parallel Opportunities

Limited parallelism since most tasks modify `location-search.tsx`. The main parallel opportunity is:

```text
Phase 2:
  T001 (use-conversation-search.ts) — independent file

Phase 3 (US1):
  T002-T003 (location-search.tsx) sequential
  T004 (map-inner.tsx) — can start after T002 completes (needs prop rename)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001)
2. Complete Phase 3: User Story 1 (T002-T004)
3. **STOP and VALIDATE**: Search for a conversation title, verify map flies there and panel opens
4. Note: Without US2, mode switching is not available — would need temporary hardcoded mode for testing

### Incremental Delivery

1. T001 → Hook ready
2. T002-T004 → Chat search works (needs US2 toggle to be user-accessible)
3. T005-T006 → Toggle added, both modes fully accessible (this is the real MVP)
4. T007-T008 → Unified keyboard/state experience
5. T009-T010 → Lint clean, fully verified

### Recommended MVP Scope

**User Stories 1 + 2 together** (T001-T006): Since the toggle is what makes chat search discoverable, the practical MVP includes both US1 and US2.

---

## Notes

- No new npm dependencies needed
- No database changes or migrations required
- Single file (`location-search.tsx`) is modified by most tasks — strictly sequential within each phase
- The `Conversation` type already has all fields needed for chat search results
- Supabase `.ilike()` provides case-insensitive partial matching natively
