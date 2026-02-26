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

- TypeScript 5.x (strict mode, no `any` types) + Next.js 14, React 18+, react-leaflet 4, (001-geochat-mvp)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (strict mode, no `any` types): Follow standard conventions

## Recent Changes
- 006-share-chat: Added TypeScript 5.x (strict mode, no `any` types) + Next.js 14, React 18+, Tailwind CSS 3, @supabase/supabase-js (no new dependencies)
- 005-topic-channels: Added TypeScript 5.x (strict mode, no `any` types) + Next.js 14, React 18+, react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js
- 004-chat-title-search: Added TypeScript 5.x (strict mode, no `any` types) + Next.js 14, React 18+, react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
