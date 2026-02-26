# Implementation Plan: Share Chat

**Branch**: `006-share-chat` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-share-chat/spec.md`

## Summary

Add a share button to the conversation panel that lets users share a conversation link via the native share sheet (mobile) or a dropdown with Copy link / Email / WhatsApp options (desktop). Shared links deep-link to the conversation using a `?c=` query parameter on the existing channel route.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any` types)
**Primary Dependencies**: Next.js 14, React 18+, Tailwind CSS 3, @supabase/supabase-js (no new dependencies)
**Storage**: N/A — no database changes, client-side URL construction only
**Testing**: `npm test && npm run lint`
**Target Platform**: Web (responsive — mobile-first, desktop fallback)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Share action completes in under 1 second; deep link loads conversation within normal page load time
**Constraints**: Must work without authentication; must use only free-tier/browser-native APIs
**Scale/Scope**: 2 new components, 2-3 modified files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --------- | ------ | ----- |
| I. Zero-Budget, Zero-Friction | PASS | Uses only browser-native APIs (Web Share, Clipboard, mailto:, wa.me). No paid services. |
| II. Open Source First | PASS | No new dependencies added. All browser APIs are standards-based. |
| III. Ship the Simplest Thing | PASS | Query param deep linking is simpler than a new route. Dropdown fallback is minimal. No share analytics, no shortened URLs. |
| IV. Real-Time Is a Core Requirement | N/A | Sharing is a one-time action, not a real-time feature. Deep-linked conversations still receive real-time messages via existing subscriptions. |
| V. Location Is a First-Class Citizen | PASS | Share text includes coordinates. Deep link centers map on conversation location. |
| VI. Anonymous by Default | PASS | No authentication required to share or open a shared link. |
| VII. The Map Is the Interface | PASS | Share button is inside the conversation panel (secondary UI). Deep links open on the map. |

**Gate result: PASS** — No violations.

## Project Structure

### Documentation (this feature)

```text
specs/006-share-chat/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── channel/
│       └── [slug]/
│           └── page.tsx           # MODIFY: read ?c= query param
├── components/
│   ├── conversation-panel.tsx     # MODIFY: add share button to header
│   ├── share-button.tsx           # CREATE: share button + dropdown
│   └── map-inner.tsx              # MODIFY: accept initialConversationId, fetch & auto-open
└── types/
    └── index.ts                   # No changes needed
```

**Structure Decision**: Follows existing flat component structure. Single new component (`share-button.tsx`) keeps the share logic self-contained. No new routes, hooks, or services needed.
