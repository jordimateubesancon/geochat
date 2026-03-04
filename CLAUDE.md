# geochat Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-23

## Active Technologies
- TypeScript 5.x (strict mode) + Next.js 14, React 18+, react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js (002-opentopomap-light-theme)
- Supabase (PostgreSQL + PostGIS) — no changes needed (002-opentopomap-light-theme)
- TypeScript 5.x (strict mode, no `any` types) + Next.js 14, React 18+, react-leaflet 4, Tailwind CSS 3, Leaflet 1.9.4 (003-nominatim-search-toolbox)
- N/A (no persistence — search results are ephemeral, session-only) (003-nominatim-search-toolbox)
- TypeScript 5.x (strict mode, no `any` types) + Next.js 14, React 18+, react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js (004-chat-title-search)
- Supabase (PostgreSQL + PostGIS) — querying existing `conversations` table by title (004-chat-title-search)
- Supabase (PostgreSQL + PostGIS) — new `channels` table + FK on `conversations` (005-topic-channels)
- TypeScript 5.x (strict mode, no `any` types) + Next.js 14, React 18+, Tailwind CSS 3, @supabase/supabase-js (no new dependencies) (006-share-chat)
- N/A — no database changes, client-side URL construction only (006-share-chat)
- TypeScript 5.x (strict mode) + Next.js 14, React 18+ + next-intl (new), existing: react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js (007-auto-i18n)
- N/A — no database changes, static JSON translation files only (007-auto-i18n)
- TypeScript 5.x (strict mode) + Next.js 14 (App Router) + react 18, react-leaflet 4, @supabase/supabase-js 2.97, next-intl 4.8, idb (new) (008-offline-mode)
- Supabase (PostgreSQL + PostGIS) server-side; IndexedDB + Cache Storage API client-side (new) (008-offline-mode)
- TypeScript 5.x (strict mode) + Next.js 14, React 18+ + react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js, next-intl 4.8 (no new dependencies) (009-safe-external-links)
- N/A — no database changes, client-side rendering only (009-safe-external-links)

- TypeScript 5.x (strict mode, no `any` types) + Next.js 14, React 18+, react-leaflet 4, (001-geochat-mvp)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

### i18n Translation Tracking

The project uses `next-intl` with manual translations. English (`src/messages/en.json`) is the source of truth, with Spanish (`es.json`) and French (`fr.json`) as targets.

A tracking script detects missing, stale, and orphan translation keys:

```bash
npm run i18n              # Show status report (missing/stale/orphan keys per locale)
npm run i18n -- --sync    # Snapshot en.json hashes after updating translations
```

**Workflow when changing UI strings:**
1. Add or edit strings in `src/messages/en.json`
2. Run `npm run i18n` to see what needs translating
3. Update `es.json` and `fr.json` manually
4. Run `npm run i18n -- --sync` to mark translations as current

**Key categories:**
- **MISSING** — key exists in en.json but not in locale file
- **STALE** — English value changed since last sync; translation may be outdated
- **ORPHAN** — key in locale file was removed from en.json; safe to delete

Tracking state is stored in `src/messages/.tracking.json` (commit this file).

## Code Style

TypeScript 5.x (strict mode, no `any` types): Follow standard conventions

## Recent Changes
- 009-safe-external-links: Added TypeScript 5.x (strict mode) + Next.js 14, React 18+ + react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js, next-intl 4.8 (no new dependencies)
- 008-offline-mode: Added TypeScript 5.x (strict mode) + Next.js 14 (App Router) + react 18, react-leaflet 4, @supabase/supabase-js 2.97, next-intl 4.8, idb (new)
- 007-auto-i18n: Added TypeScript 5.x (strict mode) + Next.js 14, React 18+ + next-intl (new), existing: react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
