# Quickstart: Nominatim Search & Map Toolbox

**Feature Branch**: `003-nominatim-search-toolbox`
**Date**: 2026-02-25

## Prerequisites

- Node.js 18+ and npm
- Existing GeoChat development environment (already set up from previous features)

## Setup

No additional setup required. This feature uses:
- The Nominatim public API (no API key needed)
- Existing project dependencies (React, react-leaflet, Tailwind CSS)

No new npm packages to install.

## Development

```bash
# Switch to feature branch
git checkout 003-nominatim-search-toolbox

# Start development server
npm run dev
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/toolbox.tsx` | Collapsible left-side panel container |
| `src/components/location-search.tsx` | Search input + autocomplete results |
| `src/hooks/use-nominatim-search.ts` | Nominatim API hook (debounce, fetch, state) |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/map-inner.tsx` | Add `toolboxOpen` state, render `<Toolbox>`, handle mobile panel exclusion |
| `src/types/index.ts` | Add `NominatimResult` interface |

## Key Implementation Notes

1. **Nominatim API call**: Simple `fetch` to `https://nominatim.openstreetmap.org/search?q={query}&format=jsonv2&limit=5` with `User-Agent: GeoChat/1.0` header.
2. **Debounce**: 300ms `setTimeout` in `useEffect`, clearing on re-render. Minimum 3 characters before searching.
3. **AbortController**: Cancel in-flight requests when new input arrives.
4. **Map navigation**: Use `map.flyToBounds()` from react-leaflet's `useMap()` hook with the Nominatim bounding box.
5. **Z-index**: Toolbox at `z-[1100]` (above map controls, below conversation panel).
6. **Mobile**: Panels are mutually exclusive — opening toolbox closes conversation panel and vice versa.

## Verification

After implementation, verify:
- [ ] Toolbox toggle button visible on the left side
- [ ] Toolbox slides open/closed smoothly
- [ ] Search for "Barcelona" returns suggestions
- [ ] Selecting a result flies the map to the correct location
- [ ] Searching for "xyzqwerty123" shows "No results found"
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Mobile: toolbox is full-width, panels are mutually exclusive
- [ ] No console errors or TypeScript warnings
