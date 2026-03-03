# Feature Specification: Automatic Browser Language Detection & Multilanguage Support

**Feature Branch**: `007-auto-i18n`
**Created**: 2026-02-27
**Status**: Draft
**Input**: User description: "We need the app to be multilanguage. Right now we don't want to include a language selector but we want the app to get the browser language or if not possible the system language and use that language as the app's language"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Language Matching (Priority: P1)

A user opens GeoChat in their browser. The application automatically detects the browser's preferred language and displays all interface text (labels, buttons, placeholders, error messages, status messages) in that language. The user does not need to configure anything — the experience is seamless from the first visit.

**Why this priority**: This is the core value proposition. Without automatic detection and translated content, the feature has no effect. This story delivers the full multilanguage experience for the most common case (browser language matches a supported language).

**Independent Test**: Can be fully tested by changing the browser language preference and reloading the app. The entire UI should render in the selected language.

**Acceptance Scenarios**:

1. **Given** the user's browser is set to Spanish (es), **When** they open GeoChat, **Then** all interface text appears in Spanish.
2. **Given** the user's browser is set to French (fr-FR), **When** they open GeoChat, **Then** the system matches the base language (fr) and displays French text.
3. **Given** the user's browser language list is [ca, es, en], **When** they open GeoChat, **Then** the system uses the first supported language from the list.

---

### User Story 2 - Fallback to English for Unsupported Languages (Priority: P2)

A user whose browser is set to a language not yet supported by GeoChat still gets a fully functional experience. The application falls back gracefully to English (the default language) so that no broken or missing text appears.

**Why this priority**: Essential for robustness. Without a proper fallback, users with unsupported languages would see broken UI or translation keys instead of real text.

**Independent Test**: Can be tested by setting the browser language to an unsupported language (e.g., Swahili) and verifying the entire UI renders in English with no missing strings.

**Acceptance Scenarios**:

1. **Given** the user's browser is set to an unsupported language (e.g., sw), **When** they open GeoChat, **Then** all text displays in English.
2. **Given** the user's browser has a list of languages none of which are supported, **When** they open GeoChat, **Then** the system falls back to English.
3. **Given** a supported language has a missing translation for a specific string, **When** that string would be displayed, **Then** the English version of that string is shown as fallback.

---

### User Story 3 - Translated Dynamic Content and Plurals (Priority: P3)

The application correctly handles translated text that includes dynamic values (coordinates, usernames, timestamps, counts) and plural forms. For example, "3 messages" should correctly pluralize according to the active language's grammar rules.

**Why this priority**: Dynamic strings and plurals represent a significant portion of the UI text. Without proper handling, the translated experience feels incomplete and unprofessional.

**Independent Test**: Can be tested by switching to a language with distinct plural rules (e.g., a language where the plural form differs from English) and verifying that conversation counts, message counts, and relative timestamps render correctly.

**Acceptance Scenarios**:

1. **Given** the app is in Spanish, **When** a conversation has 1 message, **Then** it shows "1 mensaje" (singular).
2. **Given** the app is in Spanish, **When** a conversation has 5 messages, **Then** it shows "5 mensajes" (plural).
3. **Given** the app is in French, **When** a message was sent 3 hours ago, **Then** the relative timestamp displays in French (e.g., "il y a 3h").

---

### Edge Cases

- What happens when the browser provides no language preference at all? The system falls back to English.
- What happens when a user changes their browser language mid-session? The new language takes effect on the next page load or app refresh.
- What happens when a translation file is partially complete? Missing keys fall back to English strings on a per-string basis.
- How are brand names handled? "GeoChat" remains untranslated across all languages as it is a proper noun/brand.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST detect the user's preferred language from the browser's language settings on each page load.
- **FR-002**: The system MUST match the detected browser language against the list of supported languages, using base language matching (e.g., "fr-FR" matches "fr").
- **FR-003**: When the browser provides multiple preferred languages, the system MUST use the first one that matches a supported language.
- **FR-004**: When no supported language matches the browser preference, the system MUST fall back to English (en) as the default language.
- **FR-005**: The system MUST NOT display a language selector in the UI (language is determined automatically only).
- **FR-006**: All user-facing text — including labels, buttons, placeholders, error messages, status messages, and page metadata — MUST be translatable.
- **FR-007**: Dynamic content containing variables (usernames, coordinates, counts, timestamps) MUST support interpolation within translated strings.
- **FR-008**: Plural forms MUST be handled according to each language's grammatical rules (not just singular/plural as in English).
- **FR-009**: The HTML document's `lang` attribute MUST reflect the active language for accessibility and SEO purposes.
- **FR-010**: Brand name "GeoChat" MUST remain untranslated in all languages.

### Key Entities

- **Locale**: A supported language identified by its BCP 47 language tag (e.g., "en", "es", "fr"), with an associated set of translated strings.
- **Translation String**: A key-value pair mapping a unique identifier to localized text, optionally containing interpolation placeholders and plural variants.

## Assumptions

- **Initially supported languages**: English (en) as default, plus Spanish (es) and French (fr) as initial translations. Additional languages can be added later by providing translation files.
- **No server-side language negotiation**: Language detection happens entirely on the client side using browser APIs.
- **No language persistence**: The language is detected fresh on each visit from browser settings; there is no need to store language preference since there is no user accounts system and no language selector.
- **User-generated content is not translated**: Chat messages, conversation titles, and other user-created content remain in their original language. Only the application's interface text is translated.
- **Right-to-left (RTL) languages are out of scope**: The initial release does not need to support RTL layout. This can be addressed when RTL languages are added.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users with a supported browser language see 100% of interface text in their language with zero English leakage on any screen.
- **SC-002**: Users with an unsupported browser language see 100% of interface text in English with no missing or broken strings.
- **SC-003**: Language detection and text rendering add no perceptible delay to the app's initial load time (under 100ms overhead).
- **SC-004**: Adding a new language requires only creating a new translation file — no code changes needed.
- **SC-005**: All plural forms render correctly according to each supported language's grammar rules (verified against CLDR plural rules).
