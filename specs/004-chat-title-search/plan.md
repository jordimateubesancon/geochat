# Implementation Plan: Chat Title Search with Dual Search Mode

**Branch**: `004-chat-title-search` | **Date**: 2026-02-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-chat-title-search/spec.md`

## Summary

Extend the existing toolbox search to support two modes: "Places" (Nominatim, existing) and "Chats" (conversation title search, new). A segmented pill toggle above the search input lets users switch modes. Chat search queries Supabase conversations by title using case-insensitive partial matching. Selecting a chat result flies the map to the conversation's location and opens the conversation panel.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any` types)
**Primary Dependencies**: Next.js 14, React 18+, react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js
**Storage**: Supabase (PostgreSQL + PostGIS) — querying existing `conversations` table by title
**Testing**: Manual testing + ESLint (existing setup; no test framework configured)
**Target Platform**: Web (responsive: desktop + mobile browsers)
**Project Type**: Web application (Next.js)
**Performance Goals**: Chat search results within 1s of typing pause
**Constraints**: Supabase free tier; no new external services; no new npm dependencies
**Scale/Scope**: Client-side feature with one new Supabase query; modifies existing search UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero-Budget, Zero-Friction | PASS | Uses existing Supabase free tier. No new services. |
| II. Open Source First | PASS | Supabase is open source. No new vendors. |
| III. Ship the Simplest Thing | PASS | One new hook, modify one component, add a toggle. Minimal complexity. |
| IV. Real-Time Is Core | N/A | Search is user-initiated, not real-time. |
| V. Location Is First-Class | PASS | Chat search navigates the map to conversation coordinates. |
| VI. Anonymous by Default | PASS | No auth required. Search works for all users. |
| VII. The Map Is the Interface | PASS | Search is secondary UI inside the existing toolbox. Collapsed by default. |

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-chat-title-search/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── location-search.tsx      # Modified: add search mode toggle, dual-mode results
│   └── map-inner.tsx            # Modified: pass conversation selection callback to search
├── hooks/
│   └── use-conversation-search.ts  # New: Supabase title search hook
└── types/
    └── index.ts                 # No changes needed (Conversation type already exists)
```

**Structure Decision**: Follows existing project conventions. One new hook in `src/hooks/`, modifications to two existing components. No new directories.
