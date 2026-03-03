# Tasks: Automatic Browser Language Detection & Multilanguage Support

**Input**: Design documents from `/specs/007-auto-i18n/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested — test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Install dependency and create i18n infrastructure files

- [x] T001 Install `next-intl` dependency via `npm install next-intl`
- [x] T002 Create i18n utility module with supported locales array, `detectLocale()` function (reads `navigator.languages`, base-language matching, English fallback), and message loader in `src/lib/i18n.ts`
- [x] T003 Create `I18nProvider` client component that calls `detectLocale()`, dynamically imports the matching message JSON, sets `document.documentElement.lang`, and wraps children with `NextIntlClientProvider` in `src/components/i18n-provider.tsx`
- [x] T004 Wrap `{children}` in `src/app/layout.tsx` with the `I18nProvider` component and remove hardcoded `lang="en"` from the `<html>` tag (lang is now set dynamically by the provider)

**Checkpoint**: i18n infrastructure is in place. The app loads with `next-intl` provider active but no translations extracted yet — all strings are still hardcoded.

---

## Phase 2: Foundational (English Translation File)

**Purpose**: Extract all hardcoded strings into the authoritative English translation file. This MUST complete before any component migration.

- [x] T005 Create `src/messages/en.json` with all translation keys organized by namespace. Extract every hardcoded user-facing string from all 21 files listed in the plan. Use flat dot-notation keys (e.g., `"common.cancel"`, `"messageInput.placeholder"`, `"errors.sendFailed"`). Use ICU MessageFormat for plurals (e.g., `"{count, plural, one {# message} other {# messages}}"`) and interpolation (e.g., `"Started by {name} · {time}"`). Cover all namespaces from data-model.md: common, topBar, messageInput, messageList, createDialog, channelGrid, channelCard, locationSearch, shareButton, conversationPanel, nearbyWarning, marker, mapInner, home, errors.

**Checkpoint**: English translation file is complete and authoritative. Component migration can begin.

---

## Phase 3: User Story 1 — Automatic Language Matching (Priority: P1) 🎯 MVP

**Goal**: All UI components read strings from translation files via `useTranslations()` instead of hardcoded text. A user whose browser is set to a supported language sees the full UI in that language.

**Independent Test**: Change browser language to a supported locale, reload the app — all UI text should render in that language.

### Implementation for User Story 1

**App pages** (must become client components or use translations via props):

- [x] T006 [US1] Replace hardcoded strings with `useTranslations()` calls in `src/app/page.tsx` — extract "GeoChat" subtitle, "Choose a channel..." text using `home` namespace
- [x] T007 [US1] Replace hardcoded strings with `useTranslations()` calls in `src/app/channel/[slug]/page.tsx`

**Components — core chat flow** (sequential, high-priority path):

- [x] T008 [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/message-input.tsx` — placeholder "Type a message...", "Send" button using `messageInput` namespace
- [x] T009 [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/message-list.tsx` — loading states, empty states, relative timestamps, "Beginning of conversation" using `messageList` namespace
- [x] T010 [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/conversation-panel.tsx` — "Started by {name} · {time}" template, relative timestamps using `conversationPanel` namespace
- [x] T011 [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/create-dialog.tsx` — "New Conversation", field labels, placeholders, buttons using `createDialog` namespace

**Components — map & navigation** (parallelizable, different files):

- [x] T0\1 [P] [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/top-bar.tsx` — add "use client" if needed, use `topBar` namespace
- [x] T0\1 [P] [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/map-inner.tsx` — "Click anywhere..." hint, "Conversation not found" toast using `mapInner` namespace
- [x] T0\1 [P] [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/marker.tsx` — "no messages yet", relative timestamps, message count plurals using `marker` namespace
- [x] T0\1 [P] [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/channel-grid.tsx` — empty state, error message using `channelGrid` namespace
- [x] T0\1 [P] [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/channel-card.tsx` — conversation count plural using `channelCard` namespace
- [x] T0\1 [P] [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/location-search.tsx` — mode toggles, placeholders, empty states using `locationSearch` namespace
- [x] T0\1 [P] [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/toolbox.tsx` — "Tools" header using `common` namespace
- [x] T0\1 [P] [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/share-button.tsx` — aria-label, menu items, toast, share templates using `shareButton` namespace
- [x] T0\1 [P] [US1] Replace hardcoded strings with `useTranslations()` calls in `src/components/nearby-warning.tsx` — heading, dynamic template, buttons, distance/message plurals using `nearbyWarning` namespace

**Hooks — error messages**:

- [x] T0\1 [P] [US1] Replace hardcoded error strings in `src/hooks/use-channels.ts` using `errors` namespace
- [x] T0\1 [P] [US1] Replace hardcoded error strings in `src/hooks/use-conversations.ts` using `errors` namespace
- [x] T0\1 [P] [US1] Replace hardcoded error strings in `src/hooks/use-messages.ts` using `errors` namespace
- [x] T0\1 [P] [US1] Replace hardcoded error strings in `src/hooks/use-send-message.ts` using `errors` namespace
- [x] T0\1 [P] [US1] Replace hardcoded error strings in `src/hooks/use-nominatim-search.ts` using `errors` namespace
- [x] T0\1 [P] [US1] Replace hardcoded error strings in `src/hooks/use-conversation-search.ts` using `errors` namespace

**Checkpoint**: All hardcoded strings replaced. The app renders fully translated UI when browser language matches a supported locale. User Story 1 is independently testable.

---

## Phase 4: User Story 2 — Fallback to English (Priority: P2)

**Goal**: Users with unsupported browser languages see complete English UI with no missing or broken strings.

**Independent Test**: Set browser language to an unsupported locale (e.g., Swahili), reload — all text should display in English with no translation keys visible.

### Implementation for User Story 2

- [x] T027 [US2] Verify `detectLocale()` in `src/lib/i18n.ts` correctly falls back to "en" when no browser language matches supported locales, and when `navigator.languages` is undefined/empty
- [x] T028 [US2] Verify `next-intl` fallback behavior: ensure `NextIntlClientProvider` in `src/components/i18n-provider.tsx` is configured with `onError` handler that silently falls back (no console errors for missing keys) and that English messages are loaded as the default fallback set

**Checkpoint**: Fallback behavior verified. No broken strings for unsupported languages.

---

## Phase 5: User Story 3 — Dynamic Content & Plurals (Priority: P3)

**Goal**: All interpolated values (counts, names, timestamps, coordinates) and plural forms render correctly per language grammar rules.

**Independent Test**: Switch to Spanish or French, verify plural forms (1 message vs 5 messages), relative timestamps, and interpolated templates display correctly in the target language.

### Implementation for User Story 3

- [x] T0\1 [US3] Create `src/messages/es.json` — translate all keys from en.json to Spanish, including ICU plural forms adapted to Spanish grammar and localized relative time strings
- [x] T0\1 [P] [US3] Create `src/messages/fr.json` — translate all keys from en.json to French, including ICU plural forms adapted to French grammar (e.g., zero uses singular in French) and localized relative time strings
- [x] T0\1 [US3] Review and verify all ICU MessageFormat plural/interpolation strings across all three locale files render correctly — spot-check plural edge cases (0 items, 1 item, many items) in each language

**Checkpoint**: All three locales (en, es, fr) fully functional with correct plurals and interpolation. All user stories complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T032 Verify HTML `lang` attribute updates correctly per detected locale by inspecting `document.documentElement.lang` in `src/components/i18n-provider.tsx`
- [x] T033 Verify "GeoChat" brand name remains untranslated in all locale files (`src/messages/es.json`, `src/messages/fr.json`)
- [x] T034 Run `npm test && npm run lint` to ensure no regressions from string extraction changes
- [x] T035 Run quickstart.md validation — follow the setup steps and test language switching in at least 2 browsers

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (i18n infrastructure must exist before creating translations)
- **US1 (Phase 3)**: Depends on Phase 2 (en.json must exist before components can reference keys)
- **US2 (Phase 4)**: Depends on Phase 3 (all components must use `useTranslations()` before fallback can be tested)
- **US3 (Phase 5)**: Depends on Phase 3 (en.json keys finalized before translating to es/fr)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 — can start after en.json is complete
- **User Story 2 (P2)**: Depends on US1 — fallback testing requires all components migrated
- **User Story 3 (P3)**: Depends on US1 — translation files need finalized key set from en.json

### Parallel Opportunities

**Within Phase 3 (US1)**:
- T012–T020 (map & navigation components) can all run in parallel
- T021–T026 (hook error strings) can all run in parallel
- T008–T011 (core chat flow) should be sequential to avoid key conflicts in en.json

**Within Phase 5 (US3)**:
- T029 (es.json) and T030 (fr.json) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Sequential first (core chat flow):
Task: "Replace strings in src/components/message-input.tsx"
Task: "Replace strings in src/components/message-list.tsx"
Task: "Replace strings in src/components/conversation-panel.tsx"
Task: "Replace strings in src/components/create-dialog.tsx"

# Then parallel (map & navigation — all different files):
Task: "Replace strings in src/components/top-bar.tsx"
Task: "Replace strings in src/components/map-inner.tsx"
Task: "Replace strings in src/components/marker.tsx"
Task: "Replace strings in src/components/channel-grid.tsx"
Task: "Replace strings in src/components/channel-card.tsx"
Task: "Replace strings in src/components/location-search.tsx"
Task: "Replace strings in src/components/toolbox.tsx"
Task: "Replace strings in src/components/share-button.tsx"
Task: "Replace strings in src/components/nearby-warning.tsx"

# Parallel (hooks — all different files):
Task: "Replace error strings in src/hooks/use-channels.ts"
Task: "Replace error strings in src/hooks/use-conversations.ts"
Task: "Replace error strings in src/hooks/use-messages.ts"
Task: "Replace error strings in src/hooks/use-send-message.ts"
Task: "Replace error strings in src/hooks/use-nominatim-search.ts"
Task: "Replace error strings in src/hooks/use-conversation-search.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install next-intl, create provider)
2. Complete Phase 2: Foundational (create en.json)
3. Complete Phase 3: User Story 1 (migrate all components)
4. **STOP and VALIDATE**: All UI text comes from translation keys, English works
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add User Story 1 → English translations working → Deploy/Demo (MVP!)
3. Add User Story 2 → Fallback verified → Deploy/Demo
4. Add User Story 3 → Spanish + French translations live → Deploy/Demo
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Brand name "GeoChat" must NOT be translated in any locale file
- Hooks that show error toasts need access to translations — they may need to accept a translation function as parameter or use the `useTranslations()` hook directly if already in a React component context
- Commit after each phase or logical group of tasks
