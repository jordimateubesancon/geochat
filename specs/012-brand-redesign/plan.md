# Implementation Plan: Brand Redesign — Logo-Aligned Visual Identity

**Branch**: `012-brand-redesign` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-brand-redesign/spec.md`

## Summary

Replace the app's blue accent + cool gray palette with a logo-derived green color scale and warm stone neutrals. Add Nunito heading font and display the logo on the home page. Purely visual — no functional, data, or API changes.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) + Next.js 14, React 18+
**Primary Dependencies**: Tailwind CSS 3, next/font/google (built-in, for Nunito), next-intl 4.8 (existing)
**Storage**: N/A — no data changes
**Testing**: Visual verification + `npm run lint && npm run build`
**Target Platform**: Web (responsive, 320px–1920px+)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: No measurable regression — font loaded via next/font (automatic optimization)
**Constraints**: WCAG AA (4.5:1 normal text, 3:1 large text), WCAG AAA in high-contrast mode (7:1)
**Scale/Scope**: ~22 component files, 1 config file, 1 CSS file, 1 asset

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero-Budget | PASS | Nunito is a free Google Font. No paid services. |
| II. Open Source First | PASS | All tools remain open source. |
| III. Ship Simplest Thing | PASS | Mechanical color replacement + 1 font. No new abstractions. |
| IV. Real-Time Core | PASS | No real-time changes. |
| V. Location First-Class | PASS | No geospatial changes. |
| VI. Anonymous by Default | PASS | No identity changes. |
| VII. Map Is Interface | PASS | Map remains primary. Top bar styling is secondary UI. |

**Development Guidelines check:**
- Simplicity: Tailwind's built-in color system extended with a custom scale — no new library.
- Minimal dependencies: `next/font/google` is built into Next.js (zero added deps). Tailwind `stone-*` is built-in.
- Type safety: No type changes needed.
- Security: No secrets involved.
- Errors: Font fallback is standard web behavior.

**Result: All gates PASS. No violations.**

## Project Structure

### Documentation (this feature)

```text
specs/012-brand-redesign/
├── plan.md              # This file
├── design-spec.md       # Detailed color mapping reference
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css          # High-contrast CSS updates
│   ├── layout.tsx           # Add Nunito font
│   └── page.tsx             # Logo + color + font updates
├── components/
│   ├── top-bar.tsx          # Colors + font
│   ├── channel-card.tsx     # Colors
│   ├── channel-grid.tsx     # Colors
│   ├── message-list.tsx     # Own bubble green + neutrals
│   ├── message-input.tsx    # Button + focus colors
│   ├── conversation-panel.tsx  # Neutral swap
│   ├── reaction-buttons.tsx # Active reaction green
│   ├── reaction-popover.tsx # Neutral swap
│   ├── pinned-messages.tsx  # Neutral swap (amber stays)
│   ├── accessibility-settings-panel.tsx  # Toggle + button colors
│   ├── create-dialog.tsx    # Button + focus colors
│   ├── share-button.tsx     # Neutral swap
│   ├── linkified-text.tsx   # Link colors
│   ├── link-confirmation-dialog.tsx  # Button + neutral swap
│   ├── toast.tsx            # Neutral swap
│   ├── toolbox.tsx          # Neutral swap
│   └── nearby-warning.tsx   # Neutral swap + button
├── hooks/                   # No changes
├── lib/                     # No changes
└── messages/                # No changes

tailwind.config.ts           # Add geo color scale + font-heading
public/
└── logo.png                 # Copy from repo root
```

**Structure Decision**: Existing Next.js App Router structure. No new directories or architectural changes. All modifications are in-place color/class replacements.

## Implementation Approach

### Strategy: Mechanical Replacement in 3 Layers

1. **Foundation** (tailwind.config.ts + layout.tsx): Add the `geo` color scale and Nunito font so all components can reference them immediately.

2. **Global swap** (all components): Replace `blue-*` → `geo-*` and `neutral-*` → `stone-*` class names. Tailwind's `stone-*` palette is built-in — no config needed. The `geo-*` custom scale maps to the logo's green gradient.

3. **CSS updates** (globals.css): Update high-contrast mode selectors to reference the new class names (`bg-geo-700` instead of `bg-blue-500`, `stone-*` instead of `neutral-*`).

### Color Scale Reference

From design-spec.md:

```
geo-50:  #f0f9e8    geo-500: #3d9130
geo-100: #d4edbc    geo-600: #2d7a3a
geo-200: #a8d87a    geo-700: #1f5f2a
geo-300: #7fc44e    geo-800: #164a1f
geo-400: #5aad35    geo-900: #0d3513
```

### Key Mapping Rules

| Pattern | Current | New |
|---------|---------|-----|
| Primary action bg | `blue-600` | `geo-500` |
| Primary action hover | `blue-500` | `geo-600` |
| Own message bubble | `blue-500` | `geo-700` |
| Own message timestamp | `blue-100` | `geo-200` |
| Focus ring/border | `blue-500` | `geo-400` |
| Link text | `blue-600` | `geo-500` |
| Link hover | `blue-800` | `geo-700` |
| Active toggle | `blue-500` | `geo-500` |
| Active reaction (up) | `blue-100`/`blue-600` | `geo-100`/`geo-600` |
| Card hover border | `blue-300` | `geo-300` |
| Card hover text | `blue-700` | `geo-600` |
| Pending bubble | `blue-500/60` | `geo-700/60` |
| All neutral-* | `neutral-*` | `stone-*` |

### Font Strategy

- Import Nunito via `next/font/google` in `layout.tsx`
- Expose as CSS variable `--font-heading`
- Add `fontFamily: { heading: ['var(--font-heading)', 'sans-serif'] }` to Tailwind config
- Apply `font-heading` class to: app title (page.tsx, top-bar.tsx), dialog titles (create-dialog.tsx, conversation-panel.tsx, link-confirmation-dialog.tsx)

### High-Contrast Mode Updates

Update `globals.css`:
- `--hc-own-bg`: `#e0f0ff` → `#d4edbc` (light green)
- `--hc-own-text`: `#1e3a5f` → `#0d3513` (dark green)
- `--hc-link`: `#0000ee` → `#1f5f2a` (dark green)
- Update selectors: `bg-blue-500` → `bg-geo-700`, `neutral-*` → `stone-*`

## Complexity Tracking

No constitution violations. No complexity justification needed.
