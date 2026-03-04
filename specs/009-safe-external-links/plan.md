# Implementation Plan: Safe External Links

**Branch**: `009-safe-external-links` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-safe-external-links/spec.md`

## Summary

Detect HTTP/HTTPS URLs in chat message text and render them as clickable links. Intercept all link clicks to show a confirmation dialog displaying the full destination URL, with Cancel and Open Link actions. Client-side only — no database changes, no new dependencies.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) + Next.js 14, React 18+
**Primary Dependencies**: react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js, next-intl 4.8 (no new dependencies)
**Storage**: N/A — no database changes, client-side rendering only
**Testing**: ESLint (no test framework configured)
**Target Platform**: Web (responsive, PWA-enabled)
**Project Type**: Web application (Next.js 14 App Router)
**Performance Goals**: Link detection must not introduce visible rendering delay for messages
**Constraints**: Offline-capable (links render in cached messages), no external content fetching
**Scale/Scope**: 2 new components, 1 new utility function, 1 modified component, i18n updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero-Budget, Zero-Friction | PASS | No new dependencies, no paid services |
| II. Open Source First | PASS | Pure client-side code, no proprietary tools |
| III. Ship the Simplest Thing | PASS | Regex URL detection + simple dialog — minimal approach |
| IV. Real-Time Is Core | PASS | Link rendering happens at display time, no impact on real-time message flow |
| V. Location Is First-Class | N/A | Feature doesn't involve geospatial data |
| VI. Anonymous by Default | N/A | Feature doesn't involve identity |
| VII. The Map Is the Interface | PASS | Dialog is transient, does not compete with map |
| Dev: Simplicity | PASS | Flat utility function + single dialog component |
| Dev: Minimal dependencies | PASS | Zero new dependencies — uses built-in regex |
| Dev: Type safety | PASS | All code will be strictly typed |
| Dev: Security by default | PASS | Only http/https protocols; no javascript: or data: URLs |
| Dev: Errors first-class | PASS | Dialog provides clear user feedback before navigation |

**Gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/009-safe-external-links/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── message-list.tsx             # MODIFY — replace {msg.body} with linkified rendering
│   ├── link-confirmation-dialog.tsx # NEW — confirmation dialog before opening external URL
│   └── linkified-text.tsx           # NEW — renders text with clickable links
├── lib/
│   └── linkify.ts                   # NEW — URL detection utility (regex-based)
└── messages/
    ├── en.json                      # MODIFY — add linkDialog.* keys
    ├── es.json                      # MODIFY — add linkDialog.* translations
    ├── fr.json                      # MODIFY — add linkDialog.* translations
    └── ca.json                      # MODIFY — add linkDialog.* translations
```

**Structure Decision**: Follows existing project layout. New components go in `src/components/`, utility logic in `src/lib/`. No structural changes needed.

## Complexity Tracking

No violations to justify — design is minimal and follows existing patterns.
