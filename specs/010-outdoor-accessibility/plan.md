# Implementation Plan: Outdoor Accessibility Settings

**Branch**: `010-outdoor-accessibility` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-outdoor-accessibility/spec.md`

## Summary

Add outdoor accessibility settings: high contrast mode (WCAG AAA 7:1), text size scaling (Default/Large/Extra Large), and reduced motion mode. Settings accessible from top bar, persist in localStorage, respect OS-level preferences, apply immediately without reload. No new dependencies.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) + Next.js 14, React 18+
**Primary Dependencies**: Tailwind CSS 3, next-intl 4.8 (no new dependencies)
**Storage**: localStorage (client-side preference persistence)
**Testing**: ESLint (no test framework configured)
**Target Platform**: Web (responsive, PWA-enabled, outdoor mobile use)
**Project Type**: Web application (Next.js 14 App Router)
**Performance Goals**: Settings changes apply instantly (<100ms perceived latency)
**Constraints**: Must work offline (settings stored locally), must not affect external map tiles
**Scale/Scope**: 1 new hook, 1 new context provider, 1 new settings panel component, CSS/Tailwind extensions, i18n updates, modifications to layout + top-bar + globals.css

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero-Budget, Zero-Friction | PASS | No new dependencies, no paid services |
| II. Open Source First | PASS | Pure CSS + React, no proprietary tools |
| III. Ship the Simplest Thing | PASS | Data-attribute theming on `<html>` — minimal approach |
| IV. Real-Time Is Core | N/A | Feature doesn't affect real-time messaging |
| V. Location Is First-Class | N/A | Feature doesn't involve geospatial data |
| VI. Anonymous by Default | PASS | Settings stored locally per device, no server persistence |
| VII. The Map Is the Interface | PASS | Settings panel is transient; map tiles unaffected |
| Dev: Simplicity | PASS | Single hook + context provider + CSS variables |
| Dev: Minimal dependencies | PASS | Zero new dependencies |
| Dev: Type safety | PASS | All preferences typed, strict mode |
| Dev: Security by default | PASS | No sensitive data; localStorage only |
| Dev: Errors first-class | PASS | Fallback to defaults if localStorage unavailable |
| Dev: Optimistic interaction | PASS | Settings apply immediately |

**Gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/010-outdoor-accessibility/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css                        # MODIFY — add CSS custom properties + high-contrast/text-size/reduced-motion selectors
│   └── layout.tsx                         # MODIFY — wrap with AccessibilityProvider, apply data attributes to <html>
├── components/
│   ├── top-bar.tsx                        # MODIFY — add settings button
│   ├── accessibility-settings-panel.tsx   # NEW — settings panel (slide-in or modal)
│   └── [existing components]              # MODIFY — some may need high-contrast class adjustments
├── hooks/
│   └── use-accessibility.ts               # NEW — manages preferences, localStorage, OS detection
├── lib/
│   └── accessibility.ts                   # NEW — types, defaults, constants
└── messages/
    ├── en.json                            # MODIFY — add settings.* keys
    ├── es.json                            # MODIFY — add settings.* translations
    ├── fr.json                            # MODIFY — add settings.* translations
    └── ca.json                            # MODIFY — add settings.* translations
```

**Structure Decision**: Follows existing project layout. New hook in `src/hooks/`, new utility types in `src/lib/`, new component in `src/components/`. CSS theming via data attributes on `<html>` element + CSS custom properties in `globals.css`.

## Complexity Tracking

No violations to justify — design is minimal and follows existing patterns.
