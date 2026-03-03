# Quickstart: Offline Mode

**Feature**: 008-offline-mode
**Date**: 2026-03-03

## Prerequisites

- Node.js 18+
- Existing GeoChat dev setup (`npm install` done)
- Chrome DevTools for testing (Application > Service Workers, Network throttling)

## New Dependencies

```bash
npm install idb
```

- `idb` (~5 KB gzip) — Promise-based IndexedDB wrapper for caching conversations/messages
- No other new dependencies — service worker and PWA manifest use built-in browser/Next.js APIs

## Key Files to Create

| File | Purpose |
|------|---------|
| `public/sw.js` | Service worker — tile caching, app shell caching |
| `src/app/manifest.ts` | PWA web app manifest (Next.js App Router convention) |
| `src/lib/offline-db.ts` | IndexedDB schema and CRUD helpers via `idb` |
| `src/hooks/use-online-status.ts` | Online/offline detection hook |
| `src/hooks/use-offline-cache.ts` | Write-through caching for Supabase data |
| `src/hooks/use-pending-messages.ts` | Offline message queue + sync |
| `src/components/offline-indicator.tsx` | Visual banner when offline |

## Key Files to Modify

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Register service worker, add offline indicator |
| `src/hooks/use-channels.ts` | Read from cache when offline |
| `src/hooks/use-conversations.ts` | Read from cache when offline |
| `src/hooks/use-messages.ts` | Read from cache when offline |
| `src/hooks/use-send-message.ts` | Queue to IndexedDB when offline |
| `src/components/create-dialog.tsx` | Disable when offline with explanation |
| `src/components/message-list.tsx` | Show pending message indicators |
| `src/components/map-inner.tsx` | Placeholder tiles for uncached areas |
| `next.config.mjs` | Cache-Control headers for `/sw.js` |

## Development Workflow

### Testing Offline Mode

1. Run `npm run dev` and open the app
2. Browse some conversations and map areas (to populate cache)
3. Open Chrome DevTools > Application > Service Workers
4. Check "Offline" checkbox or use Network tab > "Offline" throttle
5. Reload — cached data should appear, offline indicator should show
6. Compose a message — it should show as "pending"
7. Uncheck "Offline" — pending message should sync automatically

### Debugging Cache Contents

- **IndexedDB**: DevTools > Application > IndexedDB > `geochat-offline`
- **Cache Storage**: DevTools > Application > Cache Storage > `map-tiles-v1`
- **Service Worker**: DevTools > Application > Service Workers (check status, update, unregister)

## Architecture Notes

- **Write-through caching**: Online data flows are unchanged. After each successful Supabase fetch, results are also written to IndexedDB. This means the cache is always populated as a side effect of normal usage.
- **Read-through fallback**: When offline, hooks check `navigator.onLine` and read from IndexedDB instead of Supabase. No separate "offline mode" toggle — it's automatic.
- **Service worker scope**: The SW handles tile caching (Cache-first) and app shell caching (Network-first). It does NOT intercept Supabase API calls — that's handled by the React hooks layer via IndexedDB.
