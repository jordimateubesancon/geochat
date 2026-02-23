# Implementation Plan: GeoChat MVP

**Branch**: `001-geochat-mvp` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-geochat-mvp/spec.md`

## Summary

Build a location-based real-time conversation web app where users discover,
create, and join conversations anchored to geographic coordinates on an
interactive map. The app uses Next.js 14 (App Router) for the frontend,
Supabase (PostgreSQL + PostGIS + Realtime) for the backend, Leaflet for
map rendering, and Tailwind CSS for styling. Deployed on Vercel and
Supabase free tiers with zero cost.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any` types)
**Primary Dependencies**: Next.js 14, React 18+, react-leaflet 4,
Leaflet, @supabase/supabase-js, Tailwind CSS,
leaflet-defaulticon-compatibility
**Storage**: Supabase PostgreSQL with PostGIS extension (free tier)
**Testing**: Manual testing for V1 (no automated test framework yet)
**Target Platform**: Web browsers (desktop + mobile, min 375px width)
**Project Type**: Web application (single-page map-centric app)
**Performance Goals**: Real-time message delivery within 2 seconds;
map interactions at 60fps; conversation panel opens in < 1 second
**Constraints**: Zero budget (free tier only); no server-side compute
beyond Supabase Edge Functions; 200 concurrent Realtime connections max
**Scale/Scope**: Concept project — tens of users, hundreds of
conversations, thousands of messages. Single screen (map + overlays).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Zero-Budget, Zero-Friction | PASS | All services on free tier (Supabase free, Vercel Hobby, CARTO tiles no-key). Setup: clone + env vars + `npm run dev`. |
| II. Open Source First | PASS | Next.js (MIT), React (MIT), Leaflet (BSD-2), Supabase (Apache 2.0), Tailwind (MIT). Vercel/Supabase cloud used for convenience; both self-hostable. |
| III. Ship the Simplest Thing | PASS | Single Next.js app, no microservices, no external state management, no build-time complexity. React useState sufficient. |
| IV. Real-Time Core | PASS | Supabase Realtime Postgres Changes for messages and conversations. Sub-2-second delivery on free tier. |
| V. Location First-Class | PASS | PostGIS geography type, GiST spatial index, dedicated RPC functions for viewport and radius queries. |
| VI. Anonymous by Default | PASS | Random display name in localStorage, no auth required. Data model uses `creator_name`/`author_name` strings, not user IDs — accommodates future auth without migration. |
| VII. Map Is the Interface | PASS | Full-screen Leaflet map is the only view. Side panel and modal overlay the map. No navigation, no pages, no tabs. |

**Post-design re-check**: All gates still PASS. The `react-leaflet` and
`leaflet-defaulticon-compatibility` dependencies are justified by the
map-centric nature of the app (Principle III exception documented below).

## Project Structure

### Documentation (this feature)

```text
specs/001-geochat-mvp/
├── plan.md              # This file
├── research.md          # Phase 0: technology decisions
├── data-model.md        # Phase 1: database schema
├── quickstart.md        # Phase 1: setup guide
├── contracts/
│   └── supabase-api.md  # Phase 1: API contracts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx              # Root layout (dark theme, fonts, metadata)
│   └── page.tsx                # Main page (server component, renders Map)
├── components/
│   ├── map.tsx                 # Map wrapper (client, dynamic import)
│   ├── map-inner.tsx           # Leaflet map implementation
│   ├── conversation-panel.tsx  # Side panel (title, messages, input)
│   ├── create-dialog.tsx       # Modal for creating conversations
│   ├── nearby-warning.tsx      # Proximity warning dialog (FR-005a)
│   ├── marker.tsx              # Conversation marker with activity info
│   ├── message-list.tsx        # Scrollable messages with scroll-up pagination
│   ├── message-input.tsx       # Text input (Enter send, Shift+Enter newline)
│   └── top-bar.tsx             # App name + display name
├── hooks/
│   ├── use-conversations.ts    # Fetch viewport conversations + Realtime sub
│   ├── use-messages.ts         # Fetch paginated messages + Realtime sub
│   ├── use-send-message.ts     # Optimistic insert with rollback
│   ├── use-create-conversation.ts  # Create with proximity check
│   ├── use-map-viewport.ts     # Track/debounce viewport bounds
│   └── use-user-session.ts     # Display name from localStorage
├── lib/
│   └── supabase.ts             # Supabase client initialization
└── types/
    └── index.ts                # Conversation, Message, UserSession types

supabase/
└── migrations/
    ├── 001_enable_postgis.sql
    ├── 002_create_conversations.sql
    ├── 003_create_messages.sql
    ├── 004_create_rpc_functions.sql
    ├── 005_create_triggers.sql
    └── 006_enable_rls.sql
```

**Structure Decision**: Single Next.js project with flat component/hook
structure. No backend folder — Supabase handles all server-side concerns.
Database logic lives in SQL migrations. This is the simplest structure
that satisfies all requirements.

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| react-leaflet + leaflet-defaulticon-compatibility (2 extra deps) | Declarative map components integrate with React state naturally; icon fix is required for bundled environments | Vanilla Leaflet in useEffect loses the declarative model and requires manual DOM cleanup |
| Denormalized `message_count` + `last_message_at` on conversations | FR-003 requires markers to show count + recency; querying messages table on every viewport load would be slow | Joining messages on every marker fetch adds latency and complexity to the viewport query |
