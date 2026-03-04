# Tasks: Brand Redesign — Logo-Aligned Visual Identity

**Input**: Design documents from `/specs/012-brand-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, design-spec.md, quickstart.md

**Tests**: Not requested — verification via visual inspection + `npm run lint && npm run build`.

**Organization**: Tasks grouped by user story. US1 (green accent) is the MVP. US2 (warm neutrals) and US3 (typography + logo) are independent increments.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Add the green color scale and font to the project configuration so components can reference them.

- [X] T001 Add `geo` custom color scale (10 steps from #f0f9e8 to #0d3513) and `font-heading` family to tailwind.config.ts
- [X] T002 Add Nunito font via next/font/google and expose as CSS variable `--font-heading` in src/app/layout.tsx
- [X] T003 Copy logo.png from repo root to public/logo.png

---

## Phase 2: Foundational

**Purpose**: No foundational blocking tasks — Tailwind config (T001) and font setup (T002) are the only prerequisites for all stories.

**Checkpoint**: After Phase 1, all user story work can begin.

---

## Phase 3: User Story 1 — Green Brand Identity (Priority: P1) 🎯 MVP

**Goal**: Replace all blue accent colors with logo-derived green across every component.

**Independent Test**: Navigate home → channel → map → conversation → send message → react → settings. Every element that was blue is now green.

### Implementation for User Story 1

- [X] T004 [P] [US1] Replace blue accent classes with geo-* in src/components/message-list.tsx — own bubble: bg-blue-500 → bg-geo-700, timestamp: text-blue-100 → text-geo-200, pending bubble: bg-blue-500/60 → bg-geo-700/60
- [X] T005 [P] [US1] Replace blue accent classes with geo-* in src/components/message-input.tsx — send button: bg-blue-600 → bg-geo-500, hover: hover:bg-blue-500 → hover:bg-geo-600, focus ring/border: blue-500 → geo-400
- [X] T006 [P] [US1] Replace blue accent classes with geo-* in src/components/conversation-panel.tsx — any blue references in header or meta text
- [X] T007 [P] [US1] Replace blue accent classes with geo-* in src/components/channel-card.tsx — hover border: hover:border-blue-300 → hover:border-geo-300, hover title: group-hover:text-blue-700 → group-hover:text-geo-600
- [X] T008 [P] [US1] Replace blue accent classes with geo-* in src/components/reaction-buttons.tsx — active thumbs-up: bg-blue-100 text-blue-600 → bg-geo-100 text-geo-600 (keep red for thumbs-down)
- [X] T009 [P] [US1] Replace blue accent classes with geo-* in src/components/accessibility-settings-panel.tsx — active toggle: bg-blue-500 → bg-geo-500, active text-size button: bg-blue-500 → bg-geo-500
- [X] T010 [P] [US1] Replace blue accent classes with geo-* in src/components/create-dialog.tsx — create button: bg-blue-600 → bg-geo-500, hover: hover:bg-blue-500 → hover:bg-geo-600, focus ring/border: blue-500 → geo-400
- [X] T011 [P] [US1] Replace blue accent classes with geo-* in src/components/linkified-text.tsx — other-message links: text-blue-600 → text-geo-500, hover: text-blue-800 → text-geo-700, own-message links: hover:text-blue-100 → hover:text-geo-100
- [X] T012 [P] [US1] Replace blue accent classes with geo-* in src/components/link-confirmation-dialog.tsx — continue button: bg-blue-600 → bg-geo-500, hover: hover:bg-blue-500 → hover:bg-geo-600
- [X] T013 [P] [US1] Replace blue accent classes with geo-* in src/app/page.tsx — any blue references in the home page gear button or layout
- [X] T014 [US1] Update high-contrast mode CSS in src/app/globals.css — change --hc-own-bg to #d4edbc, --hc-own-text to #0d3513, --hc-link to #1f5f2a, update selectors from bg-blue-500 to bg-geo-700 and bg-blue-500\/60 to bg-geo-700\/60

**Checkpoint**: All blue accents are now green. App is functionally identical but visually branded.

---

## Phase 4: User Story 2 — Warm Neutral Tones (Priority: P2)

**Goal**: Replace all cool neutral-* classes with warm stone-* across every component.

**Independent Test**: Open any page — backgrounds, borders, and secondary text feel warm-toned, not clinical/cool.

### Implementation for User Story 2

- [X] T015 [P] [US2] Replace neutral-* with stone-* in src/app/page.tsx — bg-neutral-50 → bg-stone-50, text colors, icon colors
- [X] T016 [P] [US2] Replace neutral-* with stone-* in src/components/top-bar.tsx — all neutral references for backgrounds, text, borders, icon colors
- [X] T017 [P] [US2] Replace neutral-* with stone-* in src/components/channel-card.tsx — border, description text, meta text
- [X] T018 [P] [US2] Replace neutral-* with stone-* in src/components/channel-grid.tsx — skeleton loaders, empty state, error state
- [X] T019 [P] [US2] Replace neutral-* with stone-* in src/components/message-list.tsx — other bubble: bg-neutral-100 → bg-stone-100, text-neutral-900 → text-stone-800, author text, timestamp text, loading states, pin button
- [X] T020 [P] [US2] Replace neutral-* with stone-* in src/components/message-input.tsx — container bg, border, placeholder color
- [X] T021 [P] [US2] Replace neutral-* with stone-* in src/components/conversation-panel.tsx — borders, title text, meta text, close button
- [X] T022 [P] [US2] Replace neutral-* with stone-* in src/components/reaction-buttons.tsx — inactive reactions: bg-neutral-100 text-neutral-500 hover:bg-neutral-200
- [X] T023 [P] [US2] Replace neutral-* with stone-* in src/components/reaction-popover.tsx — text colors, border
- [X] T024 [P] [US2] Replace neutral-* with stone-* in src/components/pinned-messages.tsx — neutral text/border references (keep amber for pin highlights)
- [X] T025 [P] [US2] Replace neutral-* with stone-* in src/components/accessibility-settings-panel.tsx — inactive button, labels, reset button, borders
- [X] T026 [P] [US2] Replace neutral-* with stone-* in src/components/create-dialog.tsx — cancel button, labels, location badge, inputs, borders
- [X] T027 [P] [US2] Replace neutral-* with stone-* in src/components/share-button.tsx — dropdown border, menu items, icon colors
- [X] T028 [P] [US2] Replace neutral-* with stone-* in src/components/toast.tsx — info toast border and text
- [X] T029 [P] [US2] Replace neutral-* with stone-* in src/components/toolbox.tsx — header, close button, borders
- [X] T030 [P] [US2] Replace neutral-* with stone-* in src/components/nearby-warning.tsx — list items, text, borders, cancel button
- [X] T031 [P] [US2] Replace neutral-* with stone-* in src/components/link-confirmation-dialog.tsx — URL box bg, cancel button, text
- [X] T032 [US2] Update high-contrast mode CSS in src/app/globals.css — update all selectors referencing neutral-* classes to stone-* equivalents (bg-neutral-100, text-neutral-400/500/600/700/900, bg-neutral-50, border-neutral-200)

**Checkpoint**: Entire app uses warm stone neutrals. Combined with US1, the visual identity is cohesive.

---

## Phase 5: User Story 3 — Branded Typography and Logo (Priority: P3)

**Goal**: Display logo on home page, apply Nunito heading font to key headings.

**Independent Test**: Logo visible on home page. Headings use rounded font distinct from body text.

### Implementation for User Story 3

- [X] T033 [P] [US3] Add logo image and apply font-heading class to page title in src/app/page.tsx
- [X] T034 [P] [US3] Apply font-heading class to app name "GeoChat" in src/components/top-bar.tsx
- [X] T035 [P] [US3] Apply font-heading class to conversation title in src/components/conversation-panel.tsx
- [X] T036 [P] [US3] Apply font-heading class to dialog title in src/components/create-dialog.tsx
- [X] T037 [P] [US3] Apply font-heading class to dialog title in src/components/link-confirmation-dialog.tsx
- [X] T038 [P] [US3] Apply font-heading class to panel title in src/components/accessibility-settings-panel.tsx

**Checkpoint**: All headings use Nunito. Logo is displayed on home page. Brand identity is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup.

- [X] T039 Run `npm run lint` and fix any lint errors across all modified files
- [X] T040 Run `npm run build` and verify zero build errors
- [X] T041 Run quickstart.md verification scenarios (visual inspection of all 6 scenarios)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 3)**: Depends on T001 (geo color scale in Tailwind config)
- **US2 (Phase 4)**: No config dependency — stone-* is built into Tailwind. Can start in parallel with US1
- **US3 (Phase 5)**: Depends on T001 (font-heading in Tailwind config) and T002 (Nunito in layout) and T003 (logo in public/)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent — can start after T001
- **US2 (P2)**: Independent — can start immediately (stone-* is built-in). No dependency on US1
- **US3 (P3)**: Independent — can start after T001 + T002 + T003. No dependency on US1 or US2
- **Note**: Some files are touched by both US1 and US2 (e.g., message-list.tsx, message-input.tsx). If executing in parallel, merge carefully. If sequential, US2 after US1 is simplest.

### Parallel Opportunities

**Within US1**: T004–T013 can ALL run in parallel (different files, same pattern)
**Within US2**: T015–T031 can ALL run in parallel (different files, same pattern)
**Within US3**: T033–T038 can ALL run in parallel (different files, same pattern)
**Across stories**: US1 and US2 touch overlapping files, so sequential is recommended. US3 is fully independent.

---

## Parallel Example: User Story 1

```bash
# All US1 tasks can run in parallel (each touches a different file):
T004: message-list.tsx (blue → geo)
T005: message-input.tsx (blue → geo)
T006: conversation-panel.tsx (blue → geo)
T007: channel-card.tsx (blue → geo)
T008: reaction-buttons.tsx (blue → geo)
T009: accessibility-settings-panel.tsx (blue → geo)
T010: create-dialog.tsx (blue → geo)
T011: linkified-text.tsx (blue → geo)
T012: link-confirmation-dialog.tsx (blue → geo)
T013: page.tsx (blue → geo)

# Then T014 (globals.css) after all component changes to ensure selectors match
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 3: US1 (T004–T014) — green accents everywhere
3. **STOP and VALIDATE**: App is green-branded, fully functional
4. This alone delivers the most impactful visual change

### Incremental Delivery

1. Setup → Green accents (US1) → **validate** → Warm neutrals (US2) → **validate** → Typography + Logo (US3) → **validate** → Polish
2. Each increment adds visual refinement without breaking previous work

---

## Notes

- This is a mechanical color-replacement feature — most tasks are find-and-replace within Tailwind classes
- No i18n changes needed
- No functional/behavioral changes
- Amber (pins, offline) and red (errors, thumbs-down) remain unchanged
- The design-spec.md has the complete color mapping table for reference
