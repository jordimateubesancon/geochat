# Quickstart: Safe External Links

**Feature**: 009-safe-external-links
**Branch**: `009-safe-external-links`

## Setup

```bash
git checkout 009-safe-external-links
npm install   # No new dependencies, but ensures consistency
npm run dev   # Start dev server at localhost:3000
```

## What to Build

### 1. URL Detection Utility (`src/lib/linkify.ts`)

Create a `parseLinks(text: string): TextSegment[]` function that:
- Splits message text into segments of plain text and detected URLs
- Only matches `http://` and `https://` protocols
- Strips trailing sentence punctuation (`.`, `,`, `!`, `?`, `)`) when not part of URL structure

### 2. LinkifiedText Component (`src/components/linkified-text.tsx`)

Create a component that:
- Takes a `text` string prop
- Calls `parseLinks()` to split into segments
- Renders text segments as `<span>` and link segments as styled `<button>`
- Manages local state for which URL to show in the confirmation dialog
- Renders `<LinkConfirmationDialog>` when a link is clicked

### 3. Link Confirmation Dialog (`src/components/link-confirmation-dialog.tsx`)

Create a dialog following the `create-dialog.tsx` pattern:
- Shows full URL
- Cancel button (closes dialog)
- Open Link button (calls `window.open(url, "_blank", "noopener,noreferrer")`)
- Dismissible via Escape or click-outside
- Proper ARIA attributes

### 4. Integrate into Message List (`src/components/message-list.tsx`)

Replace `{msg.body}` with `<LinkifiedText text={msg.body} />` in message rendering.

### 5. i18n Updates

Add `linkDialog.*` keys to all four locale files (en, es, fr, ca).

## Verification

1. Send a message containing `https://example.com` — should render as underlined clickable link
2. Click the link — confirmation dialog should appear with full URL
3. Click Cancel — dialog closes, no navigation
4. Click Open Link — URL opens in new tab
5. Send a message with no URLs — renders as plain text (no change)
6. Send `javascript:alert(1)` — should NOT be clickable
7. Run `npm run lint` — no errors
8. Run `npm run build` — builds successfully
