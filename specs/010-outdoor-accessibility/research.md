# Research: Outdoor Accessibility Settings

**Feature**: 010-outdoor-accessibility
**Date**: 2026-03-04

## R1: Theming Approach — Data Attributes + CSS Custom Properties

**Decision**: Use `data-*` attributes on the `<html>` element combined with CSS custom properties in `globals.css` for all theme switching.

**Rationale**: The app uses Tailwind CSS with utility classes throughout. Rather than conditionally applying hundreds of Tailwind classes, we define CSS custom properties that change based on `data-contrast="high"`, `data-text-size="large|extra-large"`, and `data-motion="reduced"` attributes on `<html>`. This allows all existing components to respond to theme changes without modification — only components that need special high-contrast overrides get updated.

**Approach**:
- `globals.css` defines CSS variables: `--text-scale`, `--min-target`, colors for high-contrast mode
- `data-contrast="high"` on `<html>` triggers high-contrast CSS overrides via `[data-contrast="high"]` selectors
- `data-text-size="large"` / `data-text-size="extra-large"` triggers scaled text and touch targets
- `data-motion="reduced"` disables all transitions and animations

**Alternatives considered**:
- **Tailwind dark mode pattern** (`class` strategy): Would require adding `high-contrast:` variants throughout every component — too invasive
- **React context with conditional classes**: Would require modifying every component's className — too invasive
- **CSS-in-JS / styled-components**: Not used in the project; would add a dependency

## R2: Settings Persistence — localStorage with System Preference Defaults

**Decision**: Use `localStorage` with key `geochat_accessibility_prefs`, falling back to OS media query detection for initial defaults.

**Rationale**: Follows the existing pattern from `use-user-session.ts` which uses `localStorage.getItem/setItem` with a `geochat_` prefix. System preferences detected via `window.matchMedia()`:
- `prefers-reduced-motion: reduce` → reduced motion default on
- `prefers-contrast: more` → high contrast default on

**Storage shape**:
```json
{
  "highContrast": false,
  "textSize": "default",
  "reducedMotion": false
}
```

**Alternatives considered**:
- **IndexedDB (via idb)**: Already used for offline caching, but overkill for 3 preference values
- **Cookies**: Not used in the project; no advantage over localStorage
- **Server-side persistence**: Violates Constitution VI (anonymous by default)

## R3: Settings Panel — Slide-In Panel (Toolbox Pattern)

**Decision**: Implement the settings panel as a slide-in panel from the left, following the existing `toolbox.tsx` pattern.

**Rationale**: The toolbox component already implements a slide-in panel with:
- Full-screen on mobile (`w-dvw`), fixed width on desktop (`sm:w-72`)
- Slide transition with `transition-transform duration-200`
- Backdrop blur
- Close button
- Proper z-indexing (`z-[1500]` for toolbox)

The settings panel will use the same pattern at `z-[1800]` (above toolbox, below dialogs at `z-[2000]`). This provides a familiar interaction pattern and works well on mobile where outdoor users need large, easy-to-tap controls.

**Alternatives considered**:
- **Centered modal dialog** (like `create-dialog.tsx`): Less space for controls, harder to tap on mobile
- **Full-screen settings page**: Too heavy for 3-4 toggles; breaks the "map is the interface" principle
- **Dropdown from top bar**: Limited space, poor mobile experience

## R4: High Contrast Color Scheme

**Decision**: A single curated high-contrast theme optimized for outdoor sunlight readability.

**Rationale**: WCAG AAA requires 7:1 contrast ratio for normal text. Current app uses subtle grays (`text-neutral-500`, `bg-neutral-100`) that fail this in bright light. The high-contrast theme will use:
- **Text**: Pure black (`#000`) on pure white (`#fff`) backgrounds
- **Own messages**: Dark blue (`#1e3a5f`) text on very light blue (`#e0f0ff`) background (reversed from current white-on-blue)
- **Buttons**: High-contrast borders, solid backgrounds, no transparency
- **Borders**: 2px solid black borders on all interactive elements
- **Links**: Bold underline with high-contrast color

**Key design rule**: No transparency or opacity in high-contrast mode — `bg-white/80` becomes `bg-white`, `bg-black/60` becomes `bg-black`.

**Alternatives considered**:
- **Granular color customization**: Too complex for MVP; violates Principle III
- **Multiple contrast themes** (light high-contrast + dark high-contrast): Scope creep; single theme first

## R5: Text Scaling Strategy

**Decision**: Use a CSS custom property `--text-scale` multiplier applied via `font-size` on `<html>`, letting `rem` units cascade naturally.

**Rationale**: The app uses Tailwind's `text-sm` (0.875rem), `text-xs` (0.75rem), `text-lg` (1.125rem) throughout. Setting `font-size` on `<html>` to a larger value scales all `rem`-based sizes proportionally:
- **Default**: `font-size: 16px` (browser default)
- **Large**: `font-size: 20px` (1.25x scale)
- **Extra Large**: `font-size: 24px` (1.5x scale)

Touch targets scale proportionally since paddings use `rem`. Additional CSS ensures minimum touch target sizes via `min-height`/`min-width` on interactive elements.

**Alternatives considered**:
- **CSS `zoom`**: Not well-supported across browsers; breaks layout calculations
- **Individual class overrides**: Would require modifying every component
- **`transform: scale()`**: Doesn't reflow layout; causes overflow issues

## R6: Reduced Motion Implementation

**Decision**: Use both the CSS `data-motion="reduced"` attribute and `@media (prefers-reduced-motion: reduce)` to disable all transitions and animations.

**Rationale**: Two layers:
1. **CSS media query** (`@media (prefers-reduced-motion: reduce)`): Respects OS default automatically, no JS needed
2. **Data attribute** (`[data-motion="reduced"]`): Allows user to override/toggle independently

Both selectors apply the same rules:
- `transition-duration: 0s !important`
- `animation-duration: 0s !important`
- `scroll-behavior: auto !important`

**Affected components**: Toolbox slide-in, conversation panel slide, toast animations, message scroll, hover transitions.

## R7: i18n Keys

**Decision**: Add keys under `settings.*` namespace.

**New keys**:
- `settings.title` — "Accessibility"
- `settings.highContrast` — "High contrast"
- `settings.highContrastDescription` — "Increase contrast for outdoor visibility"
- `settings.textSize` — "Text size"
- `settings.textSizeDefault` — "Default"
- `settings.textSizeLarge` — "Large"
- `settings.textSizeExtraLarge` — "Extra large"
- `settings.reducedMotion` — "Reduce motion"
- `settings.reducedMotionDescription` — "Disable animations"
- `settings.reset` — "Reset to defaults"
- `settings.ariaLabel` — "Accessibility settings"
- `settings.closeAriaLabel` — "Close accessibility settings"
