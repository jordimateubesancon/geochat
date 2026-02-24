# Implementation Plan: OpenTopoMap Layer & Light Theme

**Branch**: `002-opentopomap-light-theme` | **Date**: 2026-02-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-opentopomap-light-theme/spec.md`

## Summary

Replace the CARTO Dark Matter tile layer with OpenTopoMap and switch the entire UI from dark theme to light theme. This is a visual-only change — no database, API, or logic changes required. All 11 component/config files with dark-themed Tailwind classes need updating.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 14, React 18+, react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js
**Storage**: Supabase (PostgreSQL + PostGIS) — no changes needed
**Testing**: Manual testing only (no automated tests in V1)
**Target Platform**: Web (desktop + mobile responsive, 375px minimum)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: N/A — visual-only change, no performance impact
**Constraints**: OpenTopoMap tile usage must comply with OSM tile usage policy (no heavy caching, user-agent required)
**Scale/Scope**: 11 files to modify (1 config, 1 layout, 9 components)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero-Budget, Zero-Friction | PASS | OpenTopoMap is free and open-source |
| II. Open Source First | PASS | OpenTopoMap is OSM-based, fully open |
| III. Ship the Simplest Thing | PASS | Direct tile URL swap + class replacements — minimal complexity |
| IV. Real-Time Is Core | PASS | No changes to realtime functionality |
| V. Location First-Class | PASS | Map tiles improve geographic context with topo features |
| VI. Anonymous by Default | PASS | No identity changes |
| VII. Map Is the Interface | PASS | Map remains the primary interface, now with richer topographic detail |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/002-opentopomap-light-theme/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # N/A — no data model changes
├── quickstart.md        # Updated setup/verification guide
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx           # Remove dark class, switch to light body
│   ├── page.tsx             # Verify no dark-specific styles
│   └── globals.css          # Verify base styles
├── components/
│   ├── map-inner.tsx        # Swap tile URL/attribution, update loading placeholder
│   ├── conversation-panel.tsx  # Dark → light theme classes
│   ├── message-list.tsx     # Dark → light theme classes
│   ├── message-input.tsx    # Dark → light theme classes
│   ├── create-dialog.tsx    # Dark → light theme classes
│   ├── nearby-warning.tsx   # Dark → light theme classes
│   ├── top-bar.tsx          # Dark → light semi-transparent background
│   ├── toast.tsx            # Dark → light theme classes
│   └── marker.tsx           # Update tooltip text colors
├── hooks/                   # No changes needed
├── lib/                     # No changes needed
└── types/                   # No changes needed

tailwind.config.ts           # Remove darkMode: "class" (optional cleanup)
```

**Structure Decision**: No structural changes. This feature modifies existing files only — no new files, no deleted files, no moved files.

## Color Mapping Strategy

The dark-to-light conversion follows this systematic mapping:

### Backgrounds

| Dark Class | Light Replacement | Usage |
|------------|-------------------|-------|
| `bg-neutral-900` | `bg-white` | Main surfaces (layout, panels) |
| `bg-neutral-900/80` | `bg-white/80` | Semi-transparent overlays (top bar) |
| `bg-neutral-800` | `bg-neutral-50` | Secondary surfaces (dialogs, inputs area) |
| `bg-neutral-800/80` | `bg-neutral-100/80` | Loading placeholder |
| `bg-neutral-800/90` | `bg-white/90` | Toast info |
| `bg-neutral-700` | `bg-neutral-100` | Input fields, tertiary surfaces |
| `bg-neutral-600` | `bg-neutral-200` | Hover states |
| `bg-red-900/90` | `bg-red-50` | Error toasts |
| `bg-blue-600` | `bg-blue-500` | Own message bubbles (keep blue, slightly lighter) |

### Text

| Dark Class | Light Replacement | Usage |
|------------|-------------------|-------|
| `text-neutral-100` | `text-neutral-900` | Primary text |
| `text-neutral-200` | `text-neutral-800` | Secondary text, hover states |
| `text-neutral-300` | `text-neutral-600` | Tertiary text, labels |
| `text-neutral-400` | `text-neutral-500` | Muted text, metadata |
| `text-neutral-500` | `text-neutral-400` | Placeholders, empty states |
| `text-red-100` | `text-red-800` | Error toast text |
| `text-blue-200` | `text-blue-600` | Own message timestamps |

### Borders

| Dark Class | Light Replacement | Usage |
|------------|-------------------|-------|
| `border-neutral-700` | `border-neutral-200` | Panel borders, dividers |
| `border-neutral-600` | `border-neutral-300` | Input borders |

### Placeholders

| Dark Class | Light Replacement | Usage |
|------------|-------------------|-------|
| `placeholder-neutral-500` | `placeholder-neutral-400` | Input placeholders |

## Complexity Tracking

No violations — no complexity justification needed.
