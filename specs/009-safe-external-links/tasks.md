# Tasks: Safe External Links

**Input**: Design documents from `/specs/009-safe-external-links/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No test framework configured — tests not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the URL detection utility and shared types that all user stories depend on

- [x] T001 Define `TextSegment` type (`{ type: "text" | "link"; value: string }`) in `src/lib/linkify.ts`
- [x] T002 Implement `parseLinks(text: string): TextSegment[]` function in `src/lib/linkify.ts` — regex-based detection of `http://` and `https://` URLs, stripping trailing sentence punctuation (`.`, `,`, `!`, `?`, `)`) when not part of URL structure

**Checkpoint**: `parseLinks()` correctly splits text into text and link segments

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: i18n keys required by UI components in all user stories

**⚠️ CRITICAL**: User Story 2+ cannot begin until this phase is complete (US1 has no dialog, so it can start independently)

- [x] T003 Add `linkDialog.*` translation keys to `src/messages/en.json`: `linkDialog.title` ("Open external link"), `linkDialog.description` ("You are about to open an external link. Please verify the URL before proceeding."), `linkDialog.url` ("URL:"), `linkDialog.open` ("Open link"), `linkDialog.ariaLabel` ("External link confirmation")
- [x] T004 [P] Add `linkDialog.*` translation keys to `src/messages/es.json` (Spanish translations)
- [x] T005 [P] Add `linkDialog.*` translation keys to `src/messages/fr.json` (French translations)
- [x] T006 [P] Add `linkDialog.*` translation keys to `src/messages/ca.json` (Catalan translations)
- [x] T007 Run `npm run i18n -- --sync` to update i18n tracking state in `src/messages/.tracking.json`

**Checkpoint**: All i18n keys present in all four locales, tracking synced

---

## Phase 3: User Story 1 - Clickable Links in Messages (Priority: P1) 🎯 MVP

**Goal**: Detect HTTP/HTTPS URLs in message text and render them as visually distinct clickable elements

**Independent Test**: Send a message containing `https://example.com` and verify it renders as a styled, clickable element distinct from surrounding text

### Implementation for User Story 1

- [x] T008 [US1] Create `<LinkifiedText>` component in `src/components/linkified-text.tsx` — accepts `text: string` and `variant: "own" | "other"` props, calls `parseLinks()`, renders text segments as `<span>` and link segments as styled `<button>` elements. Style links with `underline` and color based on variant: `text-white` for own messages, `text-blue-600` for other messages. Truncate long URLs with CSS (`max-w-[300px] inline-block overflow-hidden text-ellipsis align-bottom`).
- [x] T009 [US1] Integrate `<LinkifiedText>` into `src/components/message-list.tsx` — replace `{msg.body}` with `<LinkifiedText text={msg.body} variant={isOwn ? "own" : "other"} />` in the message rendering section. Also apply the same replacement in the pending messages section.

**Checkpoint**: URLs in messages are visually distinct and clickable (but don't navigate yet — that's US2)

---

## Phase 4: User Story 2 - Warning Confirmation Before Opening Link (Priority: P1)

**Goal**: Intercept link clicks and show a confirmation dialog with full URL, Cancel, and Open Link actions

**Independent Test**: Click any detected link in a message — confirmation dialog appears with correct URL. Cancel closes dialog. Open Link opens URL in new tab.

### Implementation for User Story 2

- [x] T010 [US2] Create `<LinkConfirmationDialog>` component in `src/components/link-confirmation-dialog.tsx` — follows existing dialog pattern from `create-dialog.tsx`: fixed overlay `z-[2000]`, centered white card, shows full URL in a scrollable/wrappable container, Cancel button and Open Link button. Open Link calls `window.open(url, "_blank", "noopener,noreferrer")` then closes dialog. Dismissible via Escape key and click-outside. Proper ARIA: `role="dialog"`, `aria-modal="true"`, `aria-label` from i18n. Focus trap between Cancel and Open Link buttons.
- [x] T011 [US2] Add dialog state management to `<LinkifiedText>` in `src/components/linkified-text.tsx` — add `useState<string | null>` for `pendingUrl`, set on link button click, render `<LinkConfirmationDialog>` when `pendingUrl` is non-null, clear on Cancel/Open.

**Checkpoint**: Full flow works — click link → dialog → Cancel or Open Link. URL opens in new tab with `noopener,noreferrer`.

---

## Phase 5: User Story 3 - Safe Display of Untrusted URLs (Priority: P2)

**Goal**: Ensure displayed link text always matches actual destination — no shortening, aliasing, or external fetching

**Independent Test**: Send messages with various URL formats and verify the link text in the message matches the URL shown in the confirmation dialog exactly

### Implementation for User Story 3

- [x] T012 [US3] Add defense-in-depth URL validation in `src/lib/linkify.ts` — after regex match, add an explicit allowlist check (`URL` constructor + protocol === `http:` or `https:`) as a second layer of safety beyond the regex pattern. This guards against edge cases where the regex might overmatch. Ensure URL value stored in `TextSegment` is the exact string from the message body with no transformation.
- [x] T013 [US3] Verify full URL display in `src/components/link-confirmation-dialog.tsx` — ensure the dialog displays the complete, unmodified URL in a word-break-friendly container (`break-all` CSS) so even very long URLs are fully visible without truncation.

**Checkpoint**: Link text in message and dialog always match. No non-HTTP protocols are clickable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality checks

- [x] T014 Run `npm run lint` and fix any lint errors across all new/modified files
- [x] T015 Run `npm run build` and verify successful production build with no type errors
- [x] T016 Run quickstart.md validation — manually test all 8 verification scenarios from `specs/009-safe-external-links/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Independent of Phase 1 — can run in parallel with Setup
- **User Story 1 (Phase 3)**: Depends on Phase 1 (needs `parseLinks()`) — can start after T002
- **User Story 2 (Phase 4)**: Depends on Phase 3 (needs `<LinkifiedText>` component) — can start after T009
- **User Story 3 (Phase 5)**: Depends on Phase 1 (refines `parseLinks()`) and Phase 4 (refines dialog) — can start after T011
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Setup (Phase 1). Foundational i18n (Phase 2) is NOT needed for US1 (no dialog text yet).
- **User Story 2 (P1)**: Depends on US1 (needs `<LinkifiedText>`) AND Foundational (needs i18n keys for dialog).
- **User Story 3 (P2)**: Depends on US2 (refines both `parseLinks()` and dialog display).

### Parallel Opportunities

- T004, T005, T006 can all run in parallel (different locale files)
- Phase 1 and Phase 2 can run in parallel (no shared files)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# After T003 (en.json), launch all other locales together:
Task T004: "Add linkDialog.* keys to src/messages/es.json"
Task T005: "Add linkDialog.* keys to src/messages/fr.json"
Task T006: "Add linkDialog.* keys to src/messages/ca.json"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (`parseLinks()` utility)
2. Complete Phase 2: Foundational (i18n keys) — can run in parallel with Phase 1
3. Complete Phase 3: User Story 1 (clickable links in messages)
4. Complete Phase 4: User Story 2 (confirmation dialog)
5. **STOP and VALIDATE**: Links are clickable, dialog works, Cancel and Open both function
6. Deploy/demo if ready — this is the MVP

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 → Links are visible and clickable → MVP foundation
3. Add US2 → Dialog protection active → **MVP complete!**
4. Add US3 → Safety hardening (protocol filtering, URL display verification)
5. Polish → Lint, build, full manual test pass

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No new dependencies required — all implemented with built-in regex and React
- No database changes — purely client-side rendering feature
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
