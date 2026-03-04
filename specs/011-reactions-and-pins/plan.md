# Implementation Plan: Message Reactions & Personal Pins

**Branch**: `011-reactions-and-pins` | **Date**: 2026-03-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-reactions-and-pins/spec.md`

## Summary

Add two features to the conversation chat: (1) public message reactions (thumbs-up/thumbs-down) with real-time aggregate counts stored server-side in Supabase, and (2) private message pinning (max 3 per conversation) stored client-side in localStorage with a pinned-messages section at the top of the chat panel.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) + Next.js 14, React 18+
**Primary Dependencies**: react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js, next-intl 4.8, idb
**Storage**: Supabase (PostgreSQL + PostGIS) for reactions; localStorage for pins; IndexedDB for offline reaction queue
**Testing**: npm test && npm run lint
**Target Platform**: Web (responsive, mobile-first)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Reaction updates visible within 1s locally, 2s for other users via real-time
**Constraints**: Offline-capable (reactions queued when offline), zero-budget (Supabase free tier), no new dependencies
**Scale/Scope**: Anonymous users, conversations with up to 50 messages per page load

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero-Budget, Zero-Friction | PASS | Uses existing Supabase free tier. No new paid services. |
| II. Open Source First | PASS | All technologies are open source. No vendor lock-in. |
| III. Ship the Simplest Thing | PASS | Reactions limited to 2 types (thumbs up/down). Pins use localStorage (simplest storage). No complex state management. |
| IV. Real-Time Is Core | PASS | Reactions broadcast via Supabase realtime postgres_changes. |
| V. Location Is First-Class | N/A | Feature does not modify geospatial behavior. |
| VI. Anonymous by Default | PASS | Uses existing session ID for reaction identity. No auth required. |
| VII. Map Is the Interface | PASS | Reactions/pins live inside the conversation panel, not competing with the map. |

**Post-design re-check**: All gates still pass. The new `message_reactions` table follows existing patterns. No new abstractions or dependencies introduced.

## Project Structure

### Documentation (this feature)

```text
specs/011-reactions-and-pins/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
supabase/
└── migrations/
    └── XXX_add_reactions.sql        # New table + RLS + realtime

src/
├── types/
│   └── index.ts                     # Add Reaction type
├── hooks/
│   ├── use-reactions.ts             # NEW — realtime reactions + optimistic updates
│   └── use-pins.ts                  # NEW — localStorage pin management
├── components/
│   ├── reaction-buttons.tsx         # NEW — inline thumbs-up/down per message
│   ├── pinned-messages.tsx          # NEW — pinned section at top of chat
│   └── message-list.tsx             # MODIFY — integrate reactions + pins
├── lib/
│   └── offline-db.ts                # MODIFY — add pending_reactions store
└── messages/
    ├── en.json                      # MODIFY — add reaction/pin i18n keys
    ├── es.json                      # MODIFY — translations
    ├── fr.json                      # MODIFY — translations
    └── ca.json                      # MODIFY — translations
```

**Structure Decision**: Follows existing project layout — hooks for data logic, components for UI, lib for utilities. No new directories needed.
