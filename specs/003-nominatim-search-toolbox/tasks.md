# Tasks: Nominatim Search & Map Toolbox

**Input**: Design documents from `/specs/003-nominatim-search-toolbox/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No test framework configured. Tests are not included. Manual verification via quickstart.md checklist.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared type definitions needed by all user stories

- [x] T001 Add `NominatimResult` interface to `src/types/index.ts` with fields: `place_id` (number), `display_name` (string), `lat` (string), `lon` (string), `boundingbox` ([string, string, string, string])

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the `useNominatimSearch` hook — the core data-fetching logic that both the search UI (US1) and error handling (US3) depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create `src/hooks/use-nominatim-search.ts` — implement the `useNominatimSearch` hook with: query state, 300ms debounce via `useEffect`/`setTimeout`, minimum 3-character threshold, `fetch` to Nominatim API (`https://nominatim.openstreetmap.org/search?q={query}&format=jsonv2&limit=5`) with `User-Agent: GeoChat/1.0` header, `AbortController` for request cancellation on new input and unmount, return `{ query, setQuery, results, loading, error }` per contract in `contracts/nominatim-api.md`

**Checkpoint**: Hook ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Search for a Location by Name (Priority: P1) MVP

**Goal**: Users can type a location name, see Nominatim suggestions, select one, and the map flies to that location with appropriate zoom.

**Independent Test**: Type "Barcelona" in the search box, verify suggestions appear, select one, verify map flies to Barcelona.

### Implementation for User Story 1

- [x] T003 [P] [US1] Create `src/components/location-search.tsx` — implement `LocationSearchProps` interface (`onSelect` callback). Render a text input bound to `useNominatimSearch` hook's `query`/`setQuery`. Display results as a list below the input showing `display_name`. On result click: parse `lat`/`lon` to numbers, parse `boundingbox` strings to numbers as `[south, north, west, east]`, call `onSelect(lat, lng, boundingbox)`. Show a loading spinner/indicator when `loading` is true. Add `aria-label` on the input, `role="listbox"` on results list, `role="option"` on each result item.
- [x] T004 [P] [US1] Create `src/components/toolbox.tsx` — implement `ToolboxProps` interface (`open`, `onToggle`, `children`). Render a toggle button (search/magnifying glass icon using inline SVG) positioned absolute on the left side below the top bar, always visible. When `open` is true, render a panel sliding from the left with `transition` and `transform` classes for smooth animation. Panel width: `w-72` on desktop, `w-full` on mobile. Z-index: `z-[1100]`. Add `pointer-events-none` on container when collapsed, `pointer-events-auto` on toggle button always. Render `{children}` inside the panel body.
- [x] T005 [US1] Integrate toolbox and search into `src/components/map-inner.tsx` — add `toolboxOpen` boolean state (default `false`). Import and render `<Toolbox>` with `<LocationSearch>` as child. Implement `onSelect` handler: access Leaflet map via `useMap()`, call `map.flyToBounds([[south, west], [north, east]])` using the bounding box, or fall back to `map.flyTo([lat, lng], 15)` if bounding box is zero-area. Close toolbox after selection on mobile (below `md` breakpoint). Add Escape key handler to close toolbox.

**Checkpoint**: User Story 1 complete — users can search and navigate the map to any location

---

## Phase 4: User Story 2 — Expandable Toolbox Panel (Priority: P2)

**Goal**: Polish the toolbox panel UX: smooth animation, responsive behavior, keyboard accessibility, and mutual exclusion with conversation panel on mobile.

**Independent Test**: Toggle toolbox open/closed on desktop and mobile. Verify smooth animation, no map blocking when collapsed, and that opening toolbox on mobile closes conversation panel.

### Implementation for User Story 2

- [x] T006 [US2] Add keyboard accessibility to `src/components/location-search.tsx` — implement keyboard navigation on the results list: arrow keys to highlight results, Enter to select highlighted result, Escape to clear results and blur input. Track `highlightedIndex` state. Add `aria-activedescendant` on input referencing the highlighted result.
- [x] T007 [US2] Add mobile panel mutual exclusion to `src/components/map-inner.tsx` — when `toolboxOpen` is set to `true` on mobile (below `md` breakpoint), set `selectedConversation` to `null`. When `selectedConversation` is set on mobile, set `toolboxOpen` to `false`. Use `window.matchMedia('(min-width: 768px)')` or check `innerWidth` to detect mobile.
- [x] T008 [US2] Add focus management to `src/components/toolbox.tsx` — when the panel opens, auto-focus the first focusable element inside (the search input). When the panel closes, return focus to the toggle button. Add `role="region"` and `aria-label="Map tools"` on the panel.

**Checkpoint**: User Story 2 complete — toolbox is fully accessible, responsive, and plays well with the conversation panel

---

## Phase 5: User Story 3 — Handle No Results and Errors Gracefully (Priority: P3)

**Goal**: Ensure every search interaction provides user feedback — results, a "no results" message, or an error message.

**Independent Test**: Search for "xyzqwerty123" and verify "No results found" appears. Simulate offline and verify error message appears.

### Implementation for User Story 3

- [x] T009 [US3] Add empty state and error UI to `src/components/location-search.tsx` — when `results` is empty array and `loading` is false and `query.length >= 3`: display "No results found" message. When `error` is not null: display the error message (e.g., "Search is temporarily unavailable") styled with a subtle warning appearance. When input is cleared (query is empty): hide the results area entirely.
- [x] T010 [US3] Refine error handling in `src/hooks/use-nominatim-search.ts` — ensure `AbortError` from cancelled requests is silently ignored (not set as error state). Set `error` to `"Search is temporarily unavailable"` for network failures and non-200 HTTP responses. Clear `error` when a new successful search completes. Clear `results` and `error` when query drops below 3 characters.

**Checkpoint**: User Story 3 complete — all search states provide clear user feedback

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements across all components

- [x] T011 [P] Run ESLint (`npm run lint`) and fix any TypeScript or linting errors across all new and modified files
- [x] T012 Run full manual verification using `specs/003-nominatim-search-toolbox/quickstart.md` checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (needs `NominatimResult` type)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (needs `useNominatimSearch` hook)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (enhances components created in US1)
- **User Story 3 (Phase 5)**: Depends on Phase 2 (enhances hook and component from US1)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational phase — creates the core components
- **User Story 2 (P2)**: Depends on US1 — enhances toolbox and search with accessibility/responsiveness
- **User Story 3 (P3)**: Can start after Foundational phase — but modifies same files as US1, so sequential execution recommended

### Within Each User Story

- T003 and T004 can run in parallel (different files)
- T005 depends on T003 and T004 (integrates both)
- T006, T007, T008 are sequential (touch overlapping concerns)
- T009 and T010 can run in parallel (different files)

### Parallel Opportunities

```text
Phase 3 (US1):
  T003 (location-search.tsx) ─┐
                               ├─→ T005 (map-inner.tsx integration)
  T004 (toolbox.tsx) ──────────┘

Phase 5 (US3):
  T009 (location-search.tsx) ─┐
                               ├─→ done
  T010 (use-nominatim-search.ts)┘
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002)
3. Complete Phase 3: User Story 1 (T003-T005)
4. **STOP and VALIDATE**: Search for a location, verify map flies to it
5. Deploy/demo if ready — core feature is fully usable

### Incremental Delivery

1. T001-T002 → Foundation ready
2. T003-T005 → Search works (MVP!)
3. T006-T008 → Keyboard accessible, mobile-friendly
4. T009-T010 → Error states polished
5. T011-T012 → Lint clean, fully verified

---

## Notes

- No new npm dependencies needed — uses native `fetch`, `AbortController`, `setTimeout`
- No database or backend changes required
- Z-index convention: toolbox at `z-[1100]` (above map `z-[1000]`, below conversation panel `z-[1500]`)
- Nominatim compliance: 300ms debounce + AbortController + `User-Agent: GeoChat/1.0` header
- Commit after each phase completion for clean git history
