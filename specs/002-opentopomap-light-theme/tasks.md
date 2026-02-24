# Tasks: OpenTopoMap Layer & Light Theme

**Input**: Design documents from `/specs/002-opentopomap-light-theme/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, quickstart.md

**Tests**: No automated tests for V1 (manual testing only per plan.md).

**Organization**: Tasks are grouped by user story. Both stories are P1 and tightly coupled (tile swap necessitates theme swap), so they share a single implementation phase with parallel opportunities.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Configuration changes that unblock all component work

- [x] T001 Remove the `dark` class from the `<html>` element and switch body classes from `bg-neutral-900 text-neutral-100` to `bg-white text-neutral-900` in `src/app/layout.tsx`
- [x] T002 Remove or comment out `darkMode: "class"` from `tailwind.config.ts` since no UI element will depend on the dark class

**Checkpoint**: App renders with a white background and dark text. Components will look broken (dark classes on light background) — this is expected until Phase 2 completes.

---

## Phase 2: User Story 1 — Switch to OpenTopoMap Tiles (Priority: P1) MVP

**Goal**: Replace CARTO Dark Matter tiles with OpenTopoMap topographic tiles. Map shows contour lines, elevation shading, trails, and peaks.

**Independent Test**: Open the app. Verify the map shows OpenTopoMap tiles with topographic features. Pan and zoom to verify tiles load at all zoom levels up to 17. Check attribution includes "OpenTopoMap".

### Implementation for User Story 1

- [x] T003 [US1] Replace the CARTO Dark Matter tile URL and attribution with OpenTopoMap tile URL (`https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`), attribution (`Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)`), and add `maxZoom={17}` to the TileLayer in `src/components/map-inner.tsx`
- [x] T004 [US1] Update the map loading placeholder background from `bg-neutral-800/80` (dark) to `bg-neutral-100/80` (light) in `src/components/map-inner.tsx`

**Checkpoint**: Map displays OpenTopoMap tiles correctly. Loading placeholder is light-themed.

---

## Phase 3: User Story 2 — Light Theme for UI Chrome (Priority: P1)

**Goal**: Switch all UI components from dark theme to light theme so the overall look is visually cohesive with OpenTopoMap's light, colorful style.

**Independent Test**: Open the app. Verify the top bar, conversation panel, dialogs, toasts, and message bubbles all use light backgrounds with dark text. All text meets WCAG AA contrast requirements.

### Implementation for User Story 2

- [x] T005 [P] [US2] Update `src/components/top-bar.tsx` — change `bg-neutral-900/80` to `bg-white/80`, `text-neutral-100` to `text-neutral-900`, and `text-neutral-400` to `text-neutral-500`
- [x] T006 [P] [US2] Update `src/components/conversation-panel.tsx` — change panel background from `bg-neutral-900` to `bg-white`, header/close button colors from neutral-100/400/500 to neutral-900/500/400, border from `border-neutral-700` to `border-neutral-200`, hover from `hover:bg-neutral-800` to `hover:bg-neutral-100`
- [x] T007 [P] [US2] Update `src/components/message-list.tsx` — change other-user bubble from `bg-neutral-700 text-neutral-100` to `bg-neutral-100 text-neutral-900`, author name from `text-neutral-300` to `text-neutral-600`, timestamp from `text-neutral-400` to `text-neutral-500`, own-message timestamp from `text-blue-200` to `text-blue-600`, empty/loading states from `text-neutral-500` to `text-neutral-400`, "Beginning of conversation" text similarly
- [x] T008 [P] [US2] Update `src/components/message-input.tsx` — change container border from `border-neutral-700` to `border-neutral-200`, input area from `bg-neutral-800` to `bg-neutral-50`, input field from `bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500` to `bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400`, send button from `bg-neutral-700 hover:bg-neutral-600 text-neutral-100` to `bg-neutral-100 hover:bg-neutral-200 text-neutral-900`
- [x] T009 [P] [US2] Update `src/components/create-dialog.tsx` — change overlay backdrop, dialog background from `bg-neutral-800` to `bg-white`, text from `text-neutral-100` to `text-neutral-900`, labels from `text-neutral-300` to `text-neutral-600`, input fields from `bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500` to `bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400`, character counters from `text-neutral-400` to `text-neutral-500`, Cancel button from `bg-neutral-700 hover:bg-neutral-600 text-neutral-300` to `bg-neutral-100 hover:bg-neutral-200 text-neutral-700`
- [x] T010 [P] [US2] Update `src/components/nearby-warning.tsx` — change dialog background from `bg-neutral-800` to `bg-white`, text from `text-neutral-100` to `text-neutral-900`, conversation list items from `bg-neutral-700 hover:bg-neutral-600` to `bg-neutral-50 hover:bg-neutral-100`, secondary text from `text-neutral-400`/`text-neutral-300` to `text-neutral-500`/`text-neutral-600`, Cancel button from `bg-neutral-700 hover:bg-neutral-600 text-neutral-300` to `bg-neutral-100 hover:bg-neutral-200 text-neutral-700`
- [x] T011 [P] [US2] Update `src/components/toast.tsx` — change info toast from `bg-neutral-800/90 text-neutral-200` to `bg-white/90 text-neutral-800 shadow-lg border border-neutral-200`, error toast from `bg-red-900/90 text-red-100` to `bg-red-50/90 text-red-800 border border-red-200`
- [x] T012 [P] [US2] Update `src/components/marker.tsx` — change any dark tooltip text colors (e.g., `text-neutral-400`) to light-appropriate equivalents (`text-neutral-500`)
- [x] T013 [US2] Update the hint text color in `src/components/map-inner.tsx` — change `text-neutral-400` to `text-neutral-600` for the empty-state hint overlay so it's readable on the light map

**Checkpoint**: All UI chrome uses light theme. App looks visually cohesive with OpenTopoMap tiles.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and contrast audit

- [x] T014 Verify WCAG AA contrast compliance across all components — check every text/background combination meets 4.5:1 ratio for normal text, 3:1 for large text; fix any violations found
- [x] T015 Run quickstart.md validation — follow every step in `specs/002-opentopomap-light-theme/quickstart.md` to verify the implementation is correct and complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **User Story 1 (Phase 2)**: Depends on Phase 1 (needs light layout to avoid visual conflict)
- **User Story 2 (Phase 3)**: Depends on Phase 1 (needs dark class removed). Can run in parallel with Phase 2.
- **Polish (Phase 4)**: Depends on Phases 2 and 3 both complete

### Within Each Phase

- Phase 1: T001 → T002 (sequential — layout before config)
- Phase 2: T003 → T004 (sequential — same file)
- Phase 3: T005-T012 all parallel (different files), then T013 (depends on T003/T004 same file)
- Phase 4: T014 → T015 (sequential — fix issues before validating)

### Parallel Opportunities

```text
Phase 1:  T001 → T002

Phase 2:  T003 → T004
                        ↘
Phase 3:  T005 ─┐       → T013
          T006 ─┤
          T007 ─┤
          T008 ─┤  All parallel (different files)
          T009 ─┤
          T010 ─┤
          T011 ─┤
          T012 ─┘

Phase 4:  T014 → T015
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Setup (remove dark class, update layout)
2. Complete Phase 2: User Story 1 (swap tile layer)
3. **STOP and VALIDATE**: Map shows OpenTopoMap tiles correctly

### Incremental Delivery

1. Setup → Dark class removed, light body
2. Add US1 → OpenTopoMap tiles visible (map works, UI still mismatched)
3. Add US2 → All UI chrome matches light theme (full visual cohesion)
4. Polish → WCAG verified, quickstart validated

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No new files created — all tasks modify existing files
- No database, API, or logic changes — purely visual
- Commit after each phase for clean rollback points
- Total: 15 tasks across 4 phases
