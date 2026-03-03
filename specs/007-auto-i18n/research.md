# Research: 007-auto-i18n

**Date**: 2026-02-27

## Decision 1: i18n Library Choice

**Decision**: Use `next-intl` in "without routing" mode

**Rationale**:
- Purpose-built for Next.js App Router with native Server Component support
- Smallest bundle size (~2KB vs ~23KB for react-i18next + i18next)
- Supports a "without routing" configuration — no locale prefixes in URLs, no middleware needed
- Built-in ICU MessageFormat for plurals (handles FR-008 natively via CLDR plural rules)
- `useTranslations()` hook works identically in client components
- `NextIntlClientProvider` wraps the app to provide translations to client components
- Actively maintained, community-preferred for Next.js 14+

**Alternatives considered**:
- **react-i18next**: More boilerplate for Next.js App Router, larger bundle, requires custom provider setup and `next-i18n-router` for routing (which we don't need). Better suited if already in the i18next ecosystem.
- **Custom React Context + JSON files**: Zero dependencies but requires implementing pluralization, interpolation, and fallback logic manually. Violates "don't reinvent" principle for a solved problem.
- **next-i18next**: Incompatible with App Router. Maintainers recommend react-i18next for App Router projects.

## Decision 2: Language Detection Strategy

**Decision**: Client-side detection using `navigator.languages` with base-language matching, no URL routing

**Rationale**:
- The spec explicitly requires no language selector and automatic browser detection only
- `navigator.languages` returns the user's preferred language list ordered by priority (FR-001, FR-003)
- Base-language matching (e.g., "fr-FR" → "fr") satisfies FR-002
- No locale in URL means no need for Next.js middleware or `[locale]` dynamic segments
- Detection happens at app load in a client-side wrapper; result passed to `NextIntlClientProvider`
- Falls back to `navigator.language` (singular) if `navigator.languages` unavailable, then to "en"

**Alternatives considered**:
- **Server-side detection via Accept-Language header**: Would require Next.js middleware and server-side rendering changes. More complex, and the spec says "client side using browser APIs."
- **URL-based locale routing (`/en/`, `/es/`)**: Standard approach but adds complexity and user-visible locale in URLs, which contradicts "no language selector" intent. Users can't change locale anyway.

## Decision 3: Translation File Structure

**Decision**: Flat JSON files in `src/messages/` directory, one file per locale (e.g., `en.json`, `es.json`, `fr.json`)

**Rationale**:
- `next-intl` natively loads JSON message files
- Flat structure with dot-notation keys (e.g., `"messageInput.placeholder"`) keeps things simple
- Namespaced by component/area for organization without nested complexity
- Adding a new language = adding a new JSON file (satisfies SC-004)
- ~50 strings is small enough that a single file per locale is manageable

**Alternatives considered**:
- **Nested JSON per namespace**: Adds file management overhead for ~50 strings. Better for 500+ strings.
- **YAML/TOML**: Requires additional parsing; JSON is natively supported.

## Decision 4: Handling Dynamic Content & Plurals

**Decision**: Use ICU MessageFormat syntax within `next-intl`

**Rationale**:
- ICU MessageFormat is the industry standard for pluralization and interpolation
- `next-intl` supports it natively: `"{count, plural, one {# message} other {# messages}}"`
- Handles complex plural rules per CLDR (e.g., languages with zero/one/two/few/many/other forms)
- Interpolation uses simple `{variable}` syntax
- Relative time formatting can use `useFormatter()` hook from `next-intl` for dates/times

**Alternatives considered**:
- **Manual plural logic per component**: Current approach in the codebase. Error-prone, doesn't scale across languages.

## Decision 5: Server Components vs Client Components

**Decision**: Detect locale client-side, wrap entire app in `NextIntlClientProvider`, use `useTranslations()` everywhere

**Rationale**:
- Most GeoChat components are already client components ("use client")
- The few server components (top-bar, channel-card, home page) will need to become client components or receive translations as props
- Since language detection is client-side (browser API), the provider must be a client component
- This is the simplest approach — one provider, one hook, consistent pattern everywhere
- The layout.tsx will render a client-side `I18nProvider` wrapper that detects locale and provides translations

**Alternatives considered**:
- **Server-side detection + server translations**: Would require middleware, Accept-Language parsing, and split server/client translation loading. More complex for no user-visible benefit since we need browser detection anyway.
