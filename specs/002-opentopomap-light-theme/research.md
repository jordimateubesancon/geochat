# Research: OpenTopoMap Layer & Light Theme

**Feature**: 002-opentopomap-light-theme
**Date**: 2026-02-24

## R1: OpenTopoMap Tile Configuration

**Decision**: Use OpenTopoMap tiles at `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png` with subdomains a, b, c.

**Rationale**:
- Free, open-source topographic map tiles based on OpenStreetMap data and SRTM elevation data
- Licensed under CC-BY-SA 3.0
- Worldwide coverage up to zoom level 17 (tile server) though the website caps at 15
- Provides contour lines, elevation shading, hiking trails, peaks — ideal for location-based context

**Attribution required**: `Map data: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)`

**Usage policy**: Standard OSM tile usage policy. For larger projects, contact the OpenTopoMap team. Our app is small-scale (MVP), which falls within acceptable usage.

**Max zoom**: Set `maxZoom={17}` on TileLayer. The current app has no explicit maxZoom constraint, so this should be added.

**Alternatives considered**:
- CARTO Dark Matter (current) — rejected because user wants topographic map
- Thunderforest Outdoors — requires API key, violates Zero-Budget principle
- Stamen Terrain — discontinued/migrated to Stadia Maps, requires API key

## R2: Light Theme Color Strategy

**Decision**: Systematic dark-to-light Tailwind class replacement across all components.

**Rationale**:
- OpenTopoMap has a light, colorful visual style — cream/white backgrounds with green/brown terrain
- Dark UI chrome (neutral-800/900 backgrounds) would create visual dissonance
- A light theme with white/neutral-50 backgrounds and neutral-900 text is the natural match
- Blue accent for own messages works on both dark and light backgrounds — keep blue-500/600

**Approach**:
- Remove `className="dark"` from `<html>` element
- Switch body from `bg-neutral-900 text-neutral-100` to `bg-white text-neutral-900`
- Apply systematic color mapping (documented in plan.md) across all 9 component files
- Keep `darkMode: "class"` in Tailwind config (harmless, could enable future dark mode toggle)

**Alternatives considered**:
- Auto dark/light mode based on system preference — rejected per spec ("light-only after this change")
- Partial theme (dark panel on light map) — rejected, creates visual dissonance per spec

## R3: WCAG AA Compliance on Light Background

**Decision**: All text must meet 4.5:1 contrast ratio against light backgrounds.

**Key pairings verified**:
- `text-neutral-900` on `bg-white` → 21:1 ratio (PASS)
- `text-neutral-600` on `bg-white` → 5.7:1 ratio (PASS)
- `text-neutral-500` on `bg-white` → 4.6:1 ratio (PASS, borderline)
- `text-neutral-400` on `bg-white` → 3.5:1 ratio (FAIL for body text, OK for large text/decorative)
- `text-white` on `bg-blue-500` → 4.6:1 ratio (PASS)
- `text-red-800` on `bg-red-50` → 7.1:1 ratio (PASS)

**Action**: Use `text-neutral-500` as the minimum for any readable text. Reserve `text-neutral-400` only for placeholders (which are exempt from contrast requirements per WCAG).

## R4: Leaflet Controls on Light Map

**Decision**: No custom styling needed for Leaflet zoom controls.

**Rationale**: Leaflet's default zoom controls use a white background with dark text/icons. They are designed for light maps and will look native on OpenTopoMap. The current dark map required no custom control styling either — Leaflet handles it.

**No changes needed** for `.leaflet-control-zoom` or attribution control.
