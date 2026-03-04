# Tasks: Outdoor Accessibility Settings

**Input**: Design documents from `/specs/010-outdoor-accessibility/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No test framework configured — tests not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create types, constants, accessibility hook, and CSS foundation that all user stories depend on

- [x] T001 [P] Define `AccessibilityPreferences` and `TextSize` types, default values, and localStorage key constant (`geochat_accessibility_prefs`) in `src/lib/accessibility.ts`
- [x] T002 Create `useAccessibility()` hook in `src/hooks/use-accessibility.ts` — reads preferences from localStorage on mount, detects OS preferences (`prefers-reduced-motion`, `prefers-contrast`) via `window.matchMedia` for initial defaults, provides `preferences` state + `setHighContrast`, `setTextSize`, `setReducedMotion`, `resetToDefaults` functions, syncs changes to localStorage, and applies `data-contrast`, `data-text-size`, `data-motion` attributes to `document.documentElement`. If localStorage write fails (e.g., private browsing, storage full), show a toast notification using the existing toast system informing the user that preferences cannot be saved, and keep preferences in React state only for the session.
- [x] T003 Integrate accessibility hook into app root in `src/app/layout.tsx` — call `useAccessibility()` at the top level (or via a thin wrapper component) so data attributes are applied on `<html>` at first render. Add `suppressHydrationWarning` if not already present.

**Checkpoint**: Data attributes appear on `<html>` based on localStorage/OS preferences. Hook reads and writes correctly.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: i18n keys and base CSS custom properties required by all user stories

**⚠️ CRITICAL**: User story implementation depends on both Phase 1 and Phase 2

- [x] T004 Add `settings.*` translation keys to `src/messages/en.json`: `settings.title` ("Accessibility"), `settings.highContrast` ("High contrast"), `settings.highContrastDescription` ("Increase contrast for outdoor visibility"), `settings.textSize` ("Text size"), `settings.textSizeDefault` ("Default"), `settings.textSizeLarge` ("Large"), `settings.textSizeExtraLarge` ("Extra large"), `settings.reducedMotion` ("Reduce motion"), `settings.reducedMotionDescription` ("Disable animations"), `settings.reset` ("Reset to defaults"), `settings.ariaLabel` ("Accessibility settings"), `settings.closeAriaLabel` ("Close accessibility settings")
- [x] T005 [P] Add `settings.*` translation keys to `src/messages/es.json` (Spanish translations)
- [x] T006 [P] Add `settings.*` translation keys to `src/messages/fr.json` (French translations)
- [x] T007 [P] Add `settings.*` translation keys to `src/messages/ca.json` (Catalan translations)
- [x] T008 Run `npm run i18n -- --sync` to update i18n tracking state in `src/messages/.tracking.json`
- [x] T009 Add base CSS structure in `src/app/globals.css` — add `[data-text-size="large"]` selector setting `html { font-size: 20px }`, `[data-text-size="extra-large"]` setting `html { font-size: 24px }`, and `[data-motion="reduced"]` + `@media (prefers-reduced-motion: reduce)` selectors disabling all transitions and animations (`transition-duration: 0s !important; animation-duration: 0s !important; scroll-behavior: auto !important`). Add default touch target enforcement: `button, input, textarea, [role="button"], a { min-height: 44px; min-width: 44px; }` to satisfy FR-004 at default text size. Add placeholder comment for high-contrast selectors (implemented in US1).

**Checkpoint**: All i18n keys present, CSS responds to data attributes for text size and motion

---

## Phase 3: User Story 3 - Accessibility Settings Panel (Priority: P1) 🎯 MVP

**Goal**: Provide a centralized, discoverable settings panel accessible from the top bar with live preview and persistent settings

**Independent Test**: Open settings panel from top bar, change a setting, close and reopen browser — setting persists and is applied

**Note**: US3 is implemented first because US1 and US2 need the panel to be testable interactively.

### Implementation for User Story 3

- [x] T010 [US3] Create `<AccessibilitySettingsPanel>` component in `src/components/accessibility-settings-panel.tsx` — slide-in panel following `toolbox.tsx` pattern at `z-[1800]`. Include: toggle for high contrast (on/off), three-option radio/button group for text size (Default/Large/Extra Large), toggle for reduced motion (on/off), "Reset to defaults" button. All controls must use `useAccessibility()` hook for live state. Panel must have: Escape key to close, click-outside to close, focus trap, proper ARIA (`role="dialog"`, `aria-modal="true"`, `aria-label`). Use i18n translations for all labels. All interactive elements must have a minimum 44x44 touch target at default size.
- [x] T011 [US3] Add settings gear icon button to `src/components/top-bar.tsx` — add a new button next to the existing search/tools toggle that opens the accessibility settings panel. Button must be always visible (no `hidden` responsive classes). Pass open/close state to `<AccessibilitySettingsPanel>`. Use `aria-label` from i18n.
- [x] T012 [US3] Render `<AccessibilitySettingsPanel>` in the appropriate parent — either in `src/app/layout.tsx` or alongside the top bar, wired to the open/close state from T011.

**Checkpoint**: Settings panel opens from top bar, toggles work with live preview, settings persist across sessions, reset button works.

---

## Phase 4: User Story 1 - High Contrast Outdoor Mode (Priority: P1)

**Goal**: All UI elements switch to a high-contrast color scheme (7:1 WCAG AAA) when enabled

**Independent Test**: Enable high contrast in settings panel — all text, buttons, chat bubbles, and controls display with high-contrast colors and borders

### Implementation for User Story 1

- [x] T013 [US1] Add high-contrast CSS selectors to `src/app/globals.css` — under `[data-contrast="high"]`, override key color variables and add rules: pure black text on pure white backgrounds, 2px solid black borders on interactive elements, no transparency/opacity (replace all `/80`, `/60` opacity with solid colors), bold text for body content, high-contrast message bubbles (dark blue on light blue for own messages, black on white for others), high-contrast buttons (solid backgrounds, visible borders). Ensure minimum 7:1 contrast ratio on all text.
- [x] T014 [US1] Verify high-contrast overrides apply to existing components — check that `src/components/top-bar.tsx`, `src/components/conversation-panel.tsx`, `src/components/message-list.tsx`, `src/components/create-dialog.tsx`, `src/components/link-confirmation-dialog.tsx`, `src/components/toast.tsx`, `src/components/toolbox.tsx`, and `src/components/channel-grid.tsx` all render correctly under high-contrast mode. Add targeted CSS overrides in `globals.css` for any component that doesn't meet 7:1 contrast with the base high-contrast rules.
- [x] T015 [US1] Verify map overlay elements in high-contrast — ensure `src/components/marker.tsx`, `src/components/location-search.tsx`, and map control buttons have high-contrast borders and colors. Map tile imagery must NOT be affected (external tiles are unchanged per FR-011).

**Checkpoint**: All UI elements meet 7:1 contrast ratio in high-contrast mode. Map tiles unaffected. Toggling off restores normal appearance.

---

## Phase 5: User Story 2 - Larger Touch Targets and Text Scaling (Priority: P1)

**Goal**: Text and interactive elements scale up when user selects Large or Extra Large, maintaining layout integrity

**Independent Test**: Set text size to "Extra Large" — all text scales up, touch targets are 56x56+, no content is clipped or hidden

### Implementation for User Story 2

- [x] T016 [US2] Add touch target minimum sizes in `src/app/globals.css` — under `[data-text-size="large"]`, set `min-height: 48px; min-width: 48px` on buttons, inputs, and interactive elements. Under `[data-text-size="extra-large"]`, set `min-height: 56px; min-width: 56px`. Use broad selectors (`button`, `input`, `textarea`, `[role="button"]`, `a`).
- [x] T017 [US2] Verify layout integrity at all text sizes — navigate through the full app at each text size (Default, Large, Extra Large) and verify: message bubbles wrap correctly, top bar doesn't overflow, settings panel remains usable, dialogs fit on screen, channel grid cards don't overlap. Add CSS fixes in `globals.css` for any layout breakage.
- [x] T018 [US2] Test very small screens (< 320px width) with Extra Large text — verify the app remains functional, content is accessible via scrolling, and no interactive elements are permanently hidden. Add responsive overrides in `globals.css` if needed.

**Checkpoint**: All three text sizes work correctly across all screens. Layout adapts, no clipping. Touch targets meet specified minimums.

---

## Phase 6: User Story 4 - Reduced Motion Mode (Priority: P2)

**Goal**: All animations and transitions are disabled, replaced with instant state changes

**Independent Test**: Enable reduced motion — conversation panel appears instantly (no slide), toolbox opens instantly, message scroll is instant, no animated spinners

### Implementation for User Story 4

- [x] T019 [US4] Verify reduced motion CSS disables all transitions — check that `src/components/toolbox.tsx` slide-in, `src/components/conversation-panel.tsx` (if it has transitions), toast fade/slide, and any `transition-*` or `animate-*` Tailwind classes are overridden by `[data-motion="reduced"]` and `@media (prefers-reduced-motion: reduce)` selectors from T009. Add targeted overrides if any animations persist.
- [x] T020 [US4] Handle JavaScript-driven animations — in `src/components/message-list.tsx`, replace `scrollIntoView({ behavior: "smooth" })` with `scrollIntoView({ behavior: "auto" })` when reduced motion is active. Use the `useAccessibility()` hook to read the preference. Check for any other JS-based smooth scrolling or animation calls.

**Checkpoint**: No visible animations when reduced motion is enabled. OS-level `prefers-reduced-motion` is respected by default.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality checks

- [x] T021 Verify all setting combinations work together — enable high contrast + Extra Large + reduced motion simultaneously. Verify layout is intact, all text is legible, no animations, all touch targets are 56x56+.
- [x] T022 Run `npm run lint` and fix any lint errors across all new/modified files
- [x] T023 Run `npm run build` and verify successful production build with no type errors
- [x] T024 Run quickstart.md validation — manually test all 13 verification scenarios from `specs/010-outdoor-accessibility/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Independent of Phase 1 — can run in parallel with Setup
- **User Story 3 (Phase 3)**: Depends on Phase 1 (needs hook) AND Phase 2 (needs i18n keys)
- **User Story 1 (Phase 4)**: Depends on Phase 3 (needs settings panel for interactive testing) AND Phase 2 (needs CSS structure)
- **User Story 2 (Phase 5)**: Depends on Phase 2 (needs CSS structure). Can run in parallel with US1.
- **User Story 4 (Phase 6)**: Depends on Phase 2 (needs CSS structure). Can run in parallel with US1/US2.
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 3 (P1)**: Gateway — implemented first so other stories have a panel to test with
- **User Story 1 (P1)**: Depends on US3 (needs panel to toggle high contrast interactively)
- **User Story 2 (P1)**: Depends on Phase 2 only. Can run in parallel with US1 after US3 is complete.
- **User Story 4 (P2)**: Depends on Phase 2 only. Can run in parallel with US1/US2.

### Parallel Opportunities

- T001, T002 can run in parallel (different files)
- T005, T006, T007 can run in parallel (different locale files)
- Phase 1 and Phase 2 can run in parallel (no shared files)
- US1, US2, and US4 can all run in parallel after US3 is complete

---

## Parallel Example: After US3 is complete

```bash
# US1, US2, US4 can all start in parallel:
Task T013: "Add high-contrast CSS to globals.css" (US1)
Task T016: "Add touch target minimum sizes to globals.css" (US2)
Task T019: "Verify reduced motion CSS" (US4)

# Note: T013 and T016 both modify globals.css — run sequentially within that file
# T019 can truly run in parallel (different scope)
```

---

## Implementation Strategy

### MVP First (User Story 3 → Settings Panel)

1. Complete Phase 1: Setup (types, hook, layout integration)
2. Complete Phase 2: Foundational (i18n, base CSS)
3. Complete Phase 3: User Story 3 (settings panel + top bar button)
4. **STOP and VALIDATE**: Panel opens, toggles work, settings persist
5. This is the minimum viable accessibility feature

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US3 → Settings panel works → **MVP!**
3. Add US1 → High contrast mode active → Outdoor sunlight usability
4. Add US2 → Text scaling works → Gloves/rain usability
5. Add US4 → Reduced motion → Motion-sensitive/bumpy environment usability
6. Polish → All combinations tested, lint, build, full validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No new dependencies required — pure CSS + React
- No database changes — localStorage only
- US3 (settings panel) is built first even though US1/US2 have equal priority, because the panel is the gateway for testing all other stories
- T013 and T016 both modify `globals.css` — must run sequentially
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
