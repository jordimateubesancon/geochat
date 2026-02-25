# Implementation Plan: Nominatim Search & Map Toolbox

**Branch**: `003-nominatim-search-toolbox` | **Date**: 2026-02-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-nominatim-search-toolbox/spec.md`

## Summary

Add a collapsible left-side toolbox panel to the map interface containing a Nominatim-powered location search tool. The toolbox is designed as an extensible container for future tools. The search queries OpenStreetMap's Nominatim API with debounced input, displays autocomplete suggestions, and flies the map to the selected location using its bounding box. The toolbox mirrors the existing conversation panel pattern (right side) on the left side.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any` types)
**Primary Dependencies**: Next.js 14, React 18+, react-leaflet 4, Tailwind CSS 3, Leaflet 1.9.4
**Storage**: N/A (no persistence — search results are ephemeral, session-only)
**Testing**: Manual testing + ESLint (existing setup; no test framework configured)
**Target Platform**: Web (responsive: desktop + mobile browsers)
**Project Type**: Web application (Next.js)
**Performance Goals**: Search suggestions within 1s of typing pause; map fly-to within 3s
**Constraints**: Nominatim usage policy (max 1 req/s, meaningful User-Agent header); no paid services
**Scale/Scope**: Single-user client-side feature; no backend changes required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero-Budget, Zero-Friction | PASS | Nominatim is free and open. No paid APIs needed. |
| II. Open Source First | PASS | Nominatim/OSM is fully open source with self-hostable option. |
| III. Ship the Simplest Thing | PASS | Single hook + 2 components. No abstractions beyond what's needed. |
| IV. Real-Time Is Core | N/A | Search is user-initiated, not real-time subscription-based. |
| V. Location Is First-Class | PASS | Feature is fundamentally geospatial — navigates map to coordinates. |
| VI. Anonymous by Default | PASS | No auth required. Search works for all users. |
| VII. The Map Is the Interface | PASS | Toolbox is secondary UI that enhances map navigation. Collapsed by default. Does not compete with the map. |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-nominatim-search-toolbox/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── toolbox.tsx              # Collapsible left-side panel container
│   ├── location-search.tsx      # Search input + results list (Nominatim)
│   └── map-inner.tsx            # Modified: add toolbox state + render
├── hooks/
│   └── use-nominatim-search.ts  # Nominatim API hook (debounce, fetch, state)
└── types/
    └── index.ts                 # Modified: add NominatimResult type
```

**Structure Decision**: Follows existing project conventions exactly. New components in `src/components/`, new hook in `src/hooks/`, types extended in `src/types/index.ts`. No new directories or architectural changes.
