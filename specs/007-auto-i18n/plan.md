# Implementation Plan: Automatic Browser Language Detection & Multilanguage Support

**Branch**: `007-auto-i18n` | **Date**: 2026-02-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-auto-i18n/spec.md`

## Summary

Add automatic multilanguage support to GeoChat. The app detects the user's browser language via `navigator.languages`, matches it against supported locales (en, es, fr), and renders all ~50 UI strings in the matched language. Uses `next-intl` in "without routing" mode — no URL locale prefixes, no language selector, no middleware. English is the fallback for unsupported languages. Adding a new language requires only a new JSON translation file.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) + Next.js 14, React 18+
**Primary Dependencies**: next-intl (new), existing: react-leaflet 4, Tailwind CSS 3, @supabase/supabase-js
**Storage**: N/A — no database changes, static JSON translation files only
**Testing**: npm test (existing), manual browser language switching for i18n verification
**Target Platform**: Web (responsive, mobile-friendly)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: <100ms overhead for language detection and text rendering (SC-003)
**Constraints**: Zero-budget (free tier only), no server-side language negotiation, client-side detection only
**Scale/Scope**: ~50 translatable strings across 21 files, 3 initial locales (en, es, fr)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero-Budget, Zero-Friction | PASS | `next-intl` is open-source, free. No paid services needed. |
| II. Open Source First | PASS | `next-intl` is MIT-licensed, no vendor lock-in. |
| III. Ship the Simplest Thing | PASS | Single dependency, no routing changes, no middleware, flat JSON files. Simplest viable approach. |
| IV. Real-Time Is Core | PASS | No impact on real-time behavior. Translations are static strings, not affecting Supabase subscriptions. |
| V. Location First-Class | PASS | No impact on geospatial features. |
| VI. Anonymous by Default | PASS | No impact on identity model. |
| VII. Map Is the Interface | PASS | No UI layout changes. Only text content changes per locale. |
| Minimal Dependencies | PASS | One new dependency (`next-intl`, ~2KB). Justified: handles pluralization, interpolation, and fallback that would require significant custom code. |
| Type Safety | PASS | `next-intl` provides TypeScript types for translation keys. |

**Post-Phase 1 Re-check**: All gates still pass. No architectural changes, no new patterns beyond a single context provider.

## Project Structure

### Documentation (this feature)

```text
specs/007-auto-i18n/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx            # Modified: wrap children with I18nProvider
│   ├── page.tsx              # Modified: replace hardcoded strings with useTranslations()
│   └── channel/
│       └── [slug]/
│           └── page.tsx      # Modified: replace hardcoded strings
├── components/
│   ├── i18n-provider.tsx     # NEW: client-side locale detection + NextIntlClientProvider
│   ├── top-bar.tsx           # Modified: replace hardcoded strings
│   ├── message-input.tsx     # Modified: replace hardcoded strings
│   ├── message-list.tsx      # Modified: replace hardcoded strings
│   ├── create-dialog.tsx     # Modified: replace hardcoded strings
│   ├── channel-grid.tsx      # Modified: replace hardcoded strings
│   ├── channel-card.tsx      # Modified: replace hardcoded strings
│   ├── location-search.tsx   # Modified: replace hardcoded strings
│   ├── share-button.tsx      # Modified: replace hardcoded strings
│   ├── conversation-panel.tsx # Modified: replace hardcoded strings
│   ├── nearby-warning.tsx    # Modified: replace hardcoded strings
│   ├── marker.tsx            # Modified: replace hardcoded strings
│   └── map-inner.tsx         # Modified: replace hardcoded strings
├── hooks/
│   ├── use-channels.ts       # Modified: replace error strings
│   ├── use-conversations.ts  # Modified: replace error strings
│   ├── use-messages.ts       # Modified: replace error strings
│   ├── use-send-message.ts   # Modified: replace error strings
│   ├── use-nominatim-search.ts # Modified: replace error strings
│   └── use-conversation-search.ts # Modified: replace error strings
├── lib/
│   └── i18n.ts               # NEW: supported locales, detection logic, message loading
├── messages/
│   ├── en.json               # NEW: English translations (authoritative)
│   ├── es.json               # NEW: Spanish translations
│   └── fr.json               # NEW: French translations
└── types/
    └── index.ts              # No changes
```

**Structure Decision**: Extends the existing Next.js App Router structure. New files are minimal: one provider component, one i18n utility module, and three translation JSON files. All existing components are modified in-place to replace hardcoded strings with `useTranslations()` calls.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
