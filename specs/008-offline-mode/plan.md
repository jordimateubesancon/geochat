# Implementation Plan: Offline Mode

**Branch**: `008-offline-mode` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-offline-mode/spec.md`

## Summary

Add offline support to GeoChat so outdoor users can browse previously viewed conversations and map tiles without connectivity, queue messages for later delivery, and install the app as a PWA. Uses a manual service worker for tile/asset caching and IndexedDB (via `idb`) for structured data caching with write-through on fetch and read-through on offline.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) + Next.js 14 (App Router)
**Primary Dependencies**: react 18, react-leaflet 4, @supabase/supabase-js 2.97, next-intl 4.8, idb (new)
**Storage**: Supabase (PostgreSQL + PostGIS) server-side; IndexedDB + Cache Storage API client-side (new)
**Testing**: Manual testing via Chrome DevTools offline simulation
**Target Platform**: Web (PWA-installable on mobile and desktop)
**Project Type**: Web application (Next.js)
**Performance Goals**: Cached data loads in <2s offline; offline indicator appears within 3s
**Constraints**: Tile cache ≤50 MB; zero-budget (no paid services); must work on Vercel free tier
**Scale/Scope**: ~90 translation keys, ~7 hooks to modify, ~4 new files, 1 service worker

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero-Budget, Zero-Friction | PASS | `idb` is free/open-source; service worker is a browser API; no paid services |
| II. Open Source First | PASS | All new dependencies are open source; no vendor lock-in |
| III. Ship the Simplest Thing | PASS | Manual SW over Serwist/Workbox; `idb` over Dexie; write-through caching over complex sync engine |
| IV. Real-Time Is Core | PASS | Real-time subscriptions continue when online; offline mode is a graceful degradation, not a replacement |
| V. Location First-Class | PASS | Cached conversations retain lat/lng; map tiles cached by coordinates |
| VI. Anonymous by Default | PASS | No auth changes; offline queue uses same anonymous display name |
| VII. Map Is the Interface | PASS | Tile caching ensures the map works offline; offline indicator is minimal, doesn't compete with map |

**Post-Phase 1 re-check**: All gates still pass. The data model adds client-side IndexedDB stores without affecting server schema. The service worker is a single `public/sw.js` file — minimal complexity.

## Project Structure

### Documentation (this feature)

```text
specs/008-offline-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output — technology decisions
├── data-model.md        # Phase 1 output — IndexedDB schema
├── quickstart.md        # Phase 1 output — dev setup guide
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── manifest.ts              # NEW — PWA web app manifest
│   └── layout.tsx               # MODIFY — register SW, add offline indicator
├── components/
│   ├── offline-indicator.tsx     # NEW — offline mode banner
│   ├── create-dialog.tsx         # MODIFY — disable when offline
│   ├── message-list.tsx          # MODIFY — pending message indicators
│   └── map-inner.tsx             # MODIFY — placeholder for uncached tiles
├── hooks/
│   ├── use-online-status.ts     # NEW — online/offline detection
│   ├── use-offline-cache.ts     # NEW — write-through IndexedDB caching
│   ├── use-pending-messages.ts  # NEW — offline message queue + sync
│   ├── use-channels.ts          # MODIFY — read from cache when offline
│   ├── use-conversations.ts     # MODIFY — read from cache when offline
│   ├── use-messages.ts          # MODIFY — read from cache when offline
│   └── use-send-message.ts      # MODIFY — queue when offline
├── lib/
│   └── offline-db.ts            # NEW — IndexedDB schema + CRUD via idb
└── messages/
    ├── en.json                   # MODIFY — add offline-related UI strings
    ├── es.json                   # MODIFY — translations
    ├── fr.json                   # MODIFY — translations
    └── ca.json                   # MODIFY — translations

public/
└── sw.js                        # NEW — service worker (tile + asset caching)

next.config.mjs                  # MODIFY — Cache-Control headers for /sw.js
package.json                     # MODIFY — add idb dependency
```

**Structure Decision**: Follows existing project structure. New files are placed in the same directories as their related existing code (hooks in `hooks/`, components in `components/`, etc.). The service worker lives in `public/` as per Next.js convention.

## Complexity Tracking

No constitution violations — no complexity justification needed.
