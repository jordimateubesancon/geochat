# Research: Offline Mode

**Feature**: 008-offline-mode
**Date**: 2026-03-03

## Decision 1: Service Worker / PWA Approach

**Decision**: Manual service worker (`public/sw.js`) + native `app/manifest.ts`

**Rationale**:
- Official Next.js 14 docs endorse this exact pattern (updated 2026-02-27)
- Zero new build-step dependencies — `public/sw.js` is served at `/sw.js` automatically
- GeoChat's caching needs are narrow (tiles + Supabase API JSON) and don't need Workbox abstractions
- `app/manifest.ts` is a built-in App Router file convention for the web app manifest — no plugin needed
- Service worker registered from a client component via `navigator.serviceWorker.register()`
- `next.config.mjs` adds `Cache-Control: no-cache` headers on `/sw.js` to ensure updates

**Alternatives considered**:
- `serwist` / `@serwist/next` — actively maintained Workbox wrapper, good typed helpers, but adds a webpack plugin dependency and build complexity for what is ultimately simple fetch-event caching
- `@ducanh2912/next-pwa` — deprecated by its own author in favor of Serwist
- `next-pwa` (shadowwalker) — abandoned since Dec 2022, no App Router support

## Decision 2: Data Caching for Conversations/Messages

**Decision**: `idb` library (~5 KB gzip) for IndexedDB access in the main thread

**Rationale**:
- Conversations and messages need structured access (e.g., "all messages for conversation X", "all conversations for channel Y in bounds")
- IndexedDB persists across restarts (unlike Cache Storage which browsers may evict)
- `idb` is the same wrapper used internally by Workbox/Serwist and Chrome team examples
- Promise-based API, thin wrapper over raw IndexedDB — no ORM overhead
- Service worker uses Cache Storage API for tile caching (separate concern)

**Alternatives considered**:
- `idb-keyval` (~1 KB) — too limited, single object store, can't do indexed queries
- `dexie` (~26 KB) — full ORM with schema migrations, reactive queries — overkill for a response cache
- Raw IndexedDB — callback/event-based API is error-prone and verbose
- Cache Storage only — works for full-response caching but awkward for structured queries

## Decision 3: Map Tile Caching Strategy

**Decision**: Cache-first strategy in the service worker using the Cache Storage API, allowing opaque responses (status 0)

**Rationale**:
- OpenTopoMap tiles are static PNGs served from `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`
- Leaflet fetches tiles as `<img>` src which produces no-cors / opaque responses (status 0)
- Opaque responses are cacheable in Cache Storage if explicitly allowed
- Cache-first is ideal: tiles rarely change, and cache hits avoid network entirely
- 50 MB storage cap with LRU eviction (track access timestamps, evict oldest)
- Opaque responses have ~7 MB storage padding in Chrome — acceptable for the expected tile count (hundreds, not thousands)

**Alternatives considered**:
- CORS tile proxy via Next.js API route — eliminates opaque response overhead but adds latency and Vercel function costs per uncached tile
- Network-first — defeats the purpose for offline use, tiles are static

## Decision 4: Online/Offline Detection

**Decision**: `navigator.onLine` + `online`/`offline` window events, supplemented by periodic Supabase connectivity check

**Rationale**:
- `navigator.onLine` and its events are supported in all modern browsers and provide instant UI feedback
- Known limitation: `navigator.onLine === true` doesn't guarantee actual internet (e.g., captive portal) — mitigated by a lightweight periodic ping to Supabase when "online"
- Keeps the implementation simple and dependency-free

## Decision 5: Pending Message Queue

**Decision**: Store pending messages in IndexedDB (via `idb`) with status tracking, sync on `online` event

**Rationale**:
- IndexedDB persists across restarts (FR-012)
- Each pending message stores: id, conversation_id, body, author_name, created_at, status (pending/sending/failed)
- On `online` event: iterate pending messages in chronological order, attempt Supabase insert, update status
- Failed messages remain with `failed` status and offer manual retry
- Integrates with existing optimistic message pattern in `use-send-message.ts`
