# Quickstart: Outdoor Accessibility Settings

**Feature**: 010-outdoor-accessibility
**Branch**: `010-outdoor-accessibility`

## Setup

```bash
git checkout 010-outdoor-accessibility
npm install   # No new dependencies
npm run dev   # Start dev server at localhost:3000
```

## What to Build

### 1. Accessibility Types & Constants (`src/lib/accessibility.ts`)

Define `AccessibilityPreferences`, `TextSize` types, default values, localStorage key, and utility functions for reading/writing preferences.

### 2. Accessibility Hook (`src/hooks/use-accessibility.ts`)

Create `useAccessibility()` hook that:
- Reads preferences from localStorage on mount
- Detects OS preferences via `window.matchMedia` for initial defaults
- Provides `preferences` state and setter functions
- Syncs changes to localStorage
- Applies `data-contrast`, `data-text-size`, `data-motion` attributes to `<html>`

### 3. CSS Theme Variables (`src/app/globals.css`)

Add CSS custom properties and data-attribute selectors:
- `[data-contrast="high"]` — high-contrast overrides (colors, borders, no transparency)
- `[data-text-size="large"]` — `font-size: 20px` on html
- `[data-text-size="extra-large"]` — `font-size: 24px` on html
- `[data-motion="reduced"]` — disable all transitions/animations
- `@media (prefers-reduced-motion: reduce)` — OS-level motion preference

### 4. Settings Panel Component (`src/components/accessibility-settings-panel.tsx`)

Create a slide-in panel (following `toolbox.tsx` pattern):
- Toggle for high contrast
- Three-option selector for text size
- Toggle for reduced motion
- Reset to defaults button
- i18n translations for all labels
- Proper ARIA attributes

### 5. Top Bar Integration (`src/components/top-bar.tsx`)

Add a settings gear icon button that opens the accessibility settings panel.

### 6. Layout Integration (`src/app/layout.tsx`)

Initialize the accessibility hook at the app root level to apply data attributes on first render.

### 7. i18n Updates

Add `settings.*` keys to all four locale files (en, es, fr, ca).

## Verification

1. Open app — default appearance, no data attributes on `<html>`
2. Click settings gear in top bar — panel slides in
3. Enable high contrast — all UI switches to high-contrast colors instantly
4. Set text size to "Large" — all text and touch targets scale up
5. Set text size to "Extra Large" — further scaling, touch targets at 56x56+
6. Enable reduced motion — slide-in animations become instant
7. Close and reopen browser — settings persist
8. Click "Reset to defaults" — everything returns to normal
9. Set OS to `prefers-reduced-motion: reduce` — app respects it by default
10. Set OS to `prefers-contrast: more` — high contrast activates by default
11. Enable all settings simultaneously — layout remains functional, no overlap
12. Run `npm run lint` — no errors
13. Run `npm run build` — builds successfully
