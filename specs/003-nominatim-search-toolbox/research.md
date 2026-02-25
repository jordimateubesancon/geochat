# Research: Nominatim Search & Map Toolbox

**Feature Branch**: `003-nominatim-search-toolbox`
**Date**: 2026-02-25

## R1: Nominatim API Integration Pattern

**Decision**: Use the Nominatim free-form search endpoint directly from the client via `fetch()`.

**Rationale**:
- The Nominatim API is a simple REST GET endpoint (`https://nominatim.openstreetmap.org/search?q=...&format=jsonv2&limit=5`).
- No API key required — only a meaningful `User-Agent` header and rate limiting compliance.
- Client-side fetch avoids adding a backend proxy route, keeping the architecture simple (Constitution Principle III).
- The `jsonv2` format returns `display_name`, `lat`, `lon`, and `boundingbox` — all fields needed for this feature.

**Alternatives considered**:
- **Next.js API route proxy**: Would add unnecessary server-side code for a public, unauthenticated API. Rejected per Principle III.
- **Third-party geocoding library** (e.g., `leaflet-geosearch`): Adds a dependency for simple GET requests. The native `fetch` is sufficient. Rejected per constitution (minimal dependencies).

## R2: Debounce Strategy

**Decision**: Implement debouncing with a custom `useEffect` + `setTimeout` pattern (300ms delay, minimum 3 characters).

**Rationale**:
- The project has no debounce utility and adding `lodash.debounce` for one use violates the minimal dependencies guideline.
- A simple `setTimeout`/`clearTimeout` inside `useEffect` is ~10 lines of code, well-understood, and testable.
- 300ms debounce balances responsiveness with Nominatim's 1 req/s policy.

**Alternatives considered**:
- **lodash.debounce**: Adds a dependency for a trivial pattern. Rejected.
- **AbortController only** (no debounce): Would still fire too many requests during fast typing. Rejected.

## R3: Toolbox Panel Architecture

**Decision**: Collapsible left-side panel rendered as a sibling to the conversation panel inside `map-inner.tsx`, controlled by a `toolboxOpen` boolean state.

**Rationale**:
- Mirrors the existing conversation panel pattern (right side). Consistent UI paradigm.
- Controlled by a simple boolean in `map-inner.tsx` — same pattern as `selectedConversation` for the right panel.
- The toolbox component accepts `children` so future tools can be added without modifying the container.
- Z-index `z-[1100]` — above the map/top-bar (`z-[1000]`) but below the conversation panel (`z-[1500]`) and modals (`z-[2000]`).

**Alternatives considered**:
- **Leaflet Control plugin**: Would bypass React rendering and make styling inconsistent. Rejected.
- **Top toolbar (horizontal)**: Takes vertical space from the map, competes with the map (violates Principle VII). Rejected.
- **Floating action button with dropdown**: Less room for multiple future tools, awkward on mobile. Rejected.

## R4: Map Fly-To Behavior

**Decision**: Use Leaflet's `map.flyToBounds()` with the Nominatim bounding box when available, falling back to `map.flyTo()` with coordinates + zoom 15.

**Rationale**:
- `flyToBounds` uses the bounding box returned by Nominatim, which provides the most appropriate zoom level for each result type (country = wide, street = tight).
- `flyTo` as fallback handles edge cases where bounding box is missing or zero-area.
- react-leaflet exposes the map instance via `useMap()` hook.

**Alternatives considered**:
- **setView (instant)**: No animation, poor UX. Rejected.
- **Fixed zoom level**: Doesn't adapt to result type (a country at zoom 15 is wrong). Rejected.

## R5: Mobile UX for Toolbox

**Decision**: On mobile, the toolbox opens as a full-width panel from the left (same as desktop but wider relative to screen). Opening the toolbox while the conversation panel is open will close the conversation panel, and vice versa.

**Rationale**:
- Full-width left panel is consistent with the mobile conversation panel behavior.
- Mutual exclusion on mobile prevents overlapping panels on small screens.
- On desktop (md+ breakpoint), both panels can coexist since there's enough width.

**Alternatives considered**:
- **Bottom sheet**: Different interaction model from conversation panel. Would introduce inconsistency. Rejected.
- **Both panels open simultaneously on mobile**: Overlapping panels on 320px screens is unusable. Rejected.

## R6: Request Cancellation

**Decision**: Use `AbortController` to cancel in-flight Nominatim requests when a new search is triggered or the component unmounts.

**Rationale**:
- Prevents stale results from overwriting newer results (race condition).
- Properly cleans up network resources on unmount.
- Native browser API — no additional dependencies.

**Alternatives considered**:
- **Ignore stale results via sequence number**: More complex, doesn't save bandwidth. Rejected.
