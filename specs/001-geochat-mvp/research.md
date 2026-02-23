# Research: GeoChat MVP

**Date**: 2026-02-23
**Branch**: `001-geochat-mvp`

## 1. Frontend Framework: Next.js 14 App Router

**Decision**: Next.js 14 with App Router. The map page layout is a server
component; the map itself is a client component loaded via `next/dynamic`
with `ssr: false`.

**Rationale**: Leaflet requires DOM access (`window`, `document`) and is
incompatible with server-side rendering. The established pattern is:
1. Page route (`app/page.tsx`) — server component, can fetch initial data.
2. Map wrapper (`components/map.tsx`) — `"use client"`, dynamically imports
   the map implementation with SSR disabled.
3. Map implementation (`components/map-inner.tsx`) — the actual Leaflet code,
   loaded only on the client.

**Alternatives considered**:
- Full static export (`output: 'export'`): Sacrifices server components and
  API routes. Not recommended given Supabase server-side helpers.
- Vanilla Leaflet in `useEffect`: More control but loses declarative React
  component model. Valid fallback if react-leaflet causes issues.

---

## 2. Map Library: Leaflet + react-leaflet

**Decision**: Use `react-leaflet` v4 with `next/dynamic` (`ssr: false`).
For the dark theme, use CARTO Dark Matter raster tiles (no API key required).

**Rationale**: react-leaflet provides declarative React components
(`<MapContainer>`, `<TileLayer>`, `<Marker>`, `<Popup>`) that integrate
naturally with React state. Actively maintained (v4 supports React 18+).
SSR incompatibility is fully solved by dynamic import.

**Tile provider**: CARTO Dark Matter
- URL: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- No API key, no published request cap for non-commercial use.

**Packages**: `leaflet`, `@types/leaflet`, `react-leaflet`,
`leaflet-defaulticon-compatibility` (fixes broken marker icons in bundled
environments).

**Alternatives considered**:
- Stadia Alidade Smooth Dark: Better aesthetics but has a free tier limit
  (2,500 tiles/month).
- MapLibre GL JS: Vector tiles with better performance, but different
  library entirely. Future upgrade path.
- CSS filter on OSM tiles: Hacky but functional dark mode.

---

## 3. Database & Geospatial: Supabase + PostGIS

**Decision**: Supabase PostgreSQL with PostGIS extension. Store coordinates
as `geography(Point, 4326)` with GiST spatial index. Expose spatial queries
as database functions called via `supabase.rpc()`.

**Rationale**: PostGIS is available on Supabase free tier (enable via
Dashboard > Database > Extensions). The `geography` type stores lat/lng as
true spherical coordinates — distance functions like `ST_DWithin` return
results in meters, which is exactly what the 1 km proximity check needs.

**Key queries** (exposed as Supabase RPC functions):
- **Viewport bounds**: `ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat)`
  with `&&` operator against the location column.
- **Radius search (1 km)**: `ST_DWithin(location, point, 1000)` — returns
  conversations within 1000 meters.

**Important**: `ST_MakePoint` takes (longitude, latitude), not (lat, lng).
This is a common source of bugs.

**Alternatives considered**:
- `geometry(Point, 4326)`: Works but distance returns degrees, not meters.
  Requires explicit casting for every distance query.
- Separate lat/lng FLOAT columns only: No spatial indexing, no PostGIS
  functions, slow viewport/radius queries.

---

## 4. Real-Time: Supabase Realtime Channels

**Decision**: Use Postgres Changes for both message delivery and new
conversation marker notifications.

**Rationale**: Supabase Realtime offers three mechanisms:
- **Postgres Changes**: CDC via WAL. Listens to INSERT/UPDATE/DELETE on
  specific tables. Respects RLS. Durable (DB-backed).
- **Broadcast**: Ephemeral pub/sub between clients. Low-latency. No DB
  round-trip.
- **Presence**: CRDT-backed in-memory state. For "who is online" features.

For GeoChat MVP:
- **New messages**: Subscribe to Postgres Changes on `messages` table,
  filtered by `conversation_id`. Messages are already inserted into DB;
  the subscription picks them up automatically.
- **New conversations**: Subscribe to Postgres Changes on `conversations`
  table for INSERT events. Clients filter by viewport bounds locally.

**Free tier limits**: 200 concurrent connections, 100 channels per tenant,
100 events/second. Sufficient for MVP.

**Alternatives considered**:
- Broadcast for messages: Lower latency but still need DB insert for
  persistence. Postgres Changes gives subscription "for free" from the
  same insert.
- Polling: Fallback if Realtime has issues. Not recommended as primary.

---

## 5. Supabase Free Tier Assessment

**Decision**: Free tier is sufficient for MVP. Main risk is 7-day
inactivity auto-pause.

| Resource               | Free Limit       | MVP Need        | OK? |
|------------------------|------------------|-----------------|-----|
| Database size          | 500 MB           | < 10 MB         | Yes |
| Realtime connections   | 200 concurrent   | ~20             | Yes |
| API requests           | Rate-limited     | Standard CRUD   | Yes |
| File storage           | 1 GB             | Not needed      | Yes |
| Auth MAU               | 50,000           | < 100           | Yes |
| Edge functions         | 500K invocations | Minimal         | Yes |
| Bandwidth              | 5 GB outbound    | Low traffic     | Yes |
| Projects               | 2                | 1               | Yes |

**Caveats**:
- Auto-pause after 7 days of no requests. Cold-start latency after idle.
  Acceptable for concept project.
- No backups on free tier. Acceptable for MVP.
- Shared compute (500 MB RAM). PostGIS queries on small datasets are fine.

---

## 6. Optimistic Updates Pattern

**Decision**: Manual optimistic update with React state. Generate UUID
client-side before insert. Deduplicate against Realtime subscription.

**Rationale**: Supabase has no built-in optimistic update support. The
recommended pattern:

1. User sends message.
2. Append to local state with the pre-generated UUID and `status: 'sending'`.
3. Call `supabase.from('messages').insert({...})`.
4. On success: Realtime subscription fires with the confirmed row. Match by
   UUID and replace optimistic entry.
5. On error: Mark as `status: 'failed'`, show error notification, offer retry.

**Key detail**: Use `.throwOnError()` on Supabase calls when using try/catch.
Without it, errors are returned in the response object and won't be caught.

**Alternatives considered**:
- TanStack Query `useMutation`: Industrial-strength approach with built-in
  optimistic/rollback. Adds dependency. Worth adopting if mutation types
  grow beyond messages.
- React 19 `useOptimistic`: Built-in hook for this pattern. Good fit if
  targeting React 19.
- No optimistic updates: Wait for Realtime confirmation (100-300ms delay).
  Simpler but less responsive.

---

## 7. Styling: Tailwind CSS

**Decision**: Tailwind CSS with utility classes. Dark theme is the only
theme for V1. No custom CSS files.

**Rationale**: Tailwind is already in the approved dependency list. Dark
theme can be set as default via `darkMode: 'class'` in config with the
`dark` class on `<html>`. Since there's only one theme, no toggle is needed.

**Alternatives considered**:
- CSS Modules: More isolated but less ergonomic for utility-first approach.
- Styled components: Runtime CSS-in-JS adds bundle size. Not recommended.

---

## 8. Deployment: Vercel

**Decision**: Deploy to Vercel from `main` branch via Git push. Free tier
(Hobby plan).

**Rationale**: Next.js is built by Vercel; deployment is zero-config.
Free tier includes automatic HTTPS, global CDN, preview deployments.

**Environment variables**: Set in Vercel dashboard for production.
`.env.local` for development (never committed).

**Alternatives considered**:
- Netlify: Good Next.js support but Vercel has first-party integration.
- Self-hosted: Overkill for MVP concept project.
