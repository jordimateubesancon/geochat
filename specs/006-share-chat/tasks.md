# Tasks: Share Chat

**Input**: Design documents from `/specs/006-share-chat/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project setup needed — this feature builds on the existing codebase. This phase covers the only foundational piece: deep link URL handling.

- [x] T001 Read `?c=` query parameter in channel page and pass conversation ID to Map component in `src/app/channel/[slug]/page.tsx`
- [x] T002 Accept `initialConversationId` prop in MapInner, fetch conversation by ID from Supabase, center map on its coordinates, and auto-open the conversation panel in `src/components/map-inner.tsx`

**Checkpoint**: Deep links (`/channel/hiking?c=<uuid>`) load the correct conversation and open the panel.

---

## Phase 2: User Story 1 — Share via native share sheet (Priority: P1) MVP

**Goal**: Add a share button to the conversation panel header that triggers the native share sheet on supported browsers, sharing the conversation title, location description, and deep link URL.

**Independent Test**: Open any conversation on a mobile browser, tap the share button, verify the native share sheet appears with correct title, location text, and URL. Select WhatsApp or email, verify content is correct. Cancel and verify the panel remains unchanged.

### Implementation for User Story 1

- [x] T003 [US1] Create `ShareButton` component in `src/components/share-button.tsx` that accepts conversation (title, id, lat, lng) and channel slug as props, builds the share URL per contracts/share-url.md, and calls `navigator.share()` with title, text, and URL
- [x] T004 [US1] Add `ShareButton` to the conversation panel header (next to the close button) in `src/components/conversation-panel.tsx`, passing conversation data and channel slug
- [x] T005 [US1] Handle `navigator.share()` rejection gracefully — if user cancels, do nothing; if API fails, fall back to dropdown (US2 behavior)

**Checkpoint**: On mobile browsers, tapping share opens the native share sheet with correct conversation details. Cancelling leaves the chat panel unchanged.

---

## Phase 3: User Story 2 — Desktop fallback dropdown (Priority: P2)

**Goal**: On browsers without Web Share API, the share button shows a dropdown with "Copy link", "Email", and "WhatsApp" options.

**Independent Test**: Open a conversation on a desktop browser (Firefox, or Chrome with Web Share disabled). Click share. Verify dropdown appears with 3 options. Test each: Copy link copies URL and shows toast, Email opens mailto: with correct subject/body, WhatsApp opens wa.me with correct text. Click outside or press Escape to close dropdown.

### Implementation for User Story 2

- [x] T006 [US2] Add dropdown state and menu UI to `ShareButton` in `src/components/share-button.tsx` — detect `navigator.share` availability; if unsupported, show dropdown on click with "Copy link", "Email", and "WhatsApp" options
- [x] T007 [US2] Implement "Copy link" action in `ShareButton` — use `navigator.clipboard.writeText()` to copy the share URL, call the toast callback with "Link copied!", close dropdown. If clipboard API fails, show the URL in the toast text as fallback.
- [x] T008 [P] [US2] Implement "Email" action in `ShareButton` — open `mailto:` link with conversation title as subject and share URL in body per contracts/share-url.md
- [x] T009 [P] [US2] Implement "WhatsApp" action in `ShareButton` — open `https://wa.me/?text=` with conversation title and share URL per contracts/share-url.md
- [x] T010 [US2] Add click-outside and Escape key handlers to close the dropdown in `src/components/share-button.tsx`
- [x] T011 [US2] Ensure share button and dropdown are keyboard-accessible (focusable, Enter/Space to activate, aria-label, aria-expanded) in `src/components/share-button.tsx`

**Checkpoint**: Desktop browsers show a dropdown with all 3 options working. Dropdown dismisses on outside click or Escape. All options are keyboard-accessible.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases and refinements that span both stories.

- [x] T012 Handle missing conversation title — use fallback text "GeoChat conversation near [lat], [lng]" in share content generation in `src/components/share-button.tsx`
- [x] T013 Handle deep link to deleted/missing conversation — show error toast and load channel normally in `src/components/map-inner.tsx`
- [x] T014 Run `npm test && npm run lint` and fix any issues

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on T001-T002 (deep link infrastructure)
- **Phase 3 (US2)**: Depends on T003 (ShareButton component exists)
- **Phase 4 (Polish)**: Depends on all previous phases

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 1 (deep link setup). No dependency on US2.
- **User Story 2 (P2)**: Depends on T003 (ShareButton component created in US1). Extends the same component with fallback behavior.

### Within Each User Story

- Core share logic before UI integration
- Native API before fallback
- Happy path before edge cases

### Parallel Opportunities

- T001 and T002 can be done sequentially (T002 depends on T001 passing the prop)
- T008 and T009 can run in parallel (different share targets, same file but independent functions)
- T012 and T013 can run in parallel (different files, independent edge cases)

---

## Parallel Example: User Story 2

```bash
# These can run in parallel (independent share targets):
Task T008: "Implement Email action in src/components/share-button.tsx"
Task T009: "Implement WhatsApp action in src/components/share-button.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Deep link setup (T001-T002)
2. Complete Phase 2: Native share button (T003-T005)
3. **STOP and VALIDATE**: Test on mobile — share sheet works, deep links work
4. Deploy if ready — mobile users can share immediately

### Incremental Delivery

1. Phase 1 → Deep links work
2. Add US1 → Mobile share works → Deploy (MVP!)
3. Add US2 → Desktop fallback works → Deploy
4. Add Polish → Edge cases handled → Deploy

---

## Notes

- [P] tasks = different files or independent logic, no dependencies
- [Story] label maps task to specific user story for traceability
- No database changes — all tasks are client-side
- No new dependencies — uses only browser-native APIs
- Commit after each phase checkpoint
