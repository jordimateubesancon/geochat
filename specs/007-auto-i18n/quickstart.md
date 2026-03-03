# Quickstart: 007-auto-i18n

**Date**: 2026-02-27

## Prerequisites

- Node.js 18+
- Existing geochat development setup (`npm install` completed)

## Setup

```bash
# 1. Switch to the feature branch
git checkout 007-auto-i18n

# 2. Install the new dependency
npm install next-intl

# 3. Start development server
npm run dev
```

## Testing Language Detection

To test different languages in your browser:

**Chrome**: Settings → Languages → Add/reorder languages → Restart
**Firefox**: Settings → General → Language → Choose your preferred language
**Safari**: System Preferences → Language & Region → Preferred Languages

After changing the browser language, reload the app. The UI should reflect the new language.

## Adding a New Language

1. Create `src/messages/{locale}.json` (copy from `en.json`)
2. Translate all values
3. Add the locale code to the `SUPPORTED_LOCALES` array in `src/lib/i18n.ts`
4. Done — no other code changes needed

## Translation File Format

Translation files use flat JSON with dot-notation keys and ICU MessageFormat for plurals/interpolation:

```json
{
  "common.cancel": "Cancel",
  "common.send": "Send",
  "channelCard.conversations": "{count, plural, one {# conversation} other {# conversations}}",
  "conversationPanel.startedBy": "Started by {name} · {time}"
}
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/i18n.ts` | Locale detection, supported locales list, message loading |
| `src/components/i18n-provider.tsx` | Client-side provider wrapping the app |
| `src/messages/en.json` | English translations (default/authoritative) |
| `src/messages/es.json` | Spanish translations |
| `src/messages/fr.json` | French translations |
