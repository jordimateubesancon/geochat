# Data Model: 007-auto-i18n

**Date**: 2026-02-27

## Overview

This feature introduces no database changes. All data is static translation files and client-side runtime state.

## Entities

### Locale

A supported language for the application interface.

| Attribute     | Description                                       |
|---------------|---------------------------------------------------|
| code          | BCP 47 language tag (e.g., "en", "es", "fr")     |
| messages      | Complete set of translated strings for this locale |
| isDefault     | Whether this is the fallback locale (only "en")   |

**Supported locales (initial)**:
- `en` — English (default/fallback)
- `es` — Spanish
- `fr` — French

### Translation Message

A single translatable string within a locale's message file.

| Attribute     | Description                                                    |
|---------------|----------------------------------------------------------------|
| key           | Dot-notation identifier (e.g., "messageInput.placeholder")    |
| value         | Translated text, may contain ICU MessageFormat syntax          |

**Key namespaces** (organized by UI area):

| Namespace           | Description                        | Approx. count |
|---------------------|------------------------------------|----------------|
| `common`            | Shared labels (Cancel, Send, etc.) | ~8             |
| `topBar`            | App header                         | ~1             |
| `messageInput`      | Message composition                | ~2             |
| `messageList`       | Message display & timestamps       | ~8             |
| `createDialog`      | New conversation dialog            | ~8             |
| `channelGrid`       | Channel listing                    | ~2             |
| `channelCard`       | Individual channel card            | ~2             |
| `locationSearch`    | Search UI                          | ~6             |
| `shareButton`       | Share functionality                | ~6             |
| `conversationPanel` | Conversation detail view           | ~3             |
| `nearbyWarning`     | Nearby conversations dialog        | ~6             |
| `marker`            | Map markers                        | ~4             |
| `mapInner`          | Map interaction hints              | ~2             |
| `home`              | Home/landing page                  | ~2             |
| `errors`            | Error messages from hooks          | ~6             |

**ICU MessageFormat examples**:

```
// Plural
"channelCard.conversations": "{count, plural, one {# conversation} other {# conversations}}"

// Interpolation
"conversationPanel.startedBy": "Started by {name} · {time}"

// Relative time (simple)
"time.minutesAgo": "{count}m ago"
```

## State Flow

```
Browser Load
  → navigator.languages read
  → Match against supported locales (base-language matching)
  → First match selected (or "en" fallback)
  → Locale code + messages passed to NextIntlClientProvider
  → All components access translations via useTranslations() hook
  → HTML lang attribute updated to active locale
```

## File Structure

```
src/messages/
├── en.json    # English (default — complete, authoritative)
├── es.json    # Spanish
└── fr.json    # French
```

Each file contains all keys. Missing keys in es/fr fall back to en.json values at runtime.
