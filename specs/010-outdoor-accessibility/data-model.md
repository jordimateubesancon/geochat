# Data Model: Outdoor Accessibility Settings

**Feature**: 010-outdoor-accessibility
**Date**: 2026-03-04

## Overview

This feature requires **no database changes**. All accessibility preferences are stored client-side in localStorage. No server-side persistence.

## Client-Side Types

### AccessibilityPreferences

Represents the user's saved accessibility settings.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| highContrast | boolean | false (or true if OS `prefers-contrast: more`) | Whether high-contrast mode is active |
| textSize | `"default"` \| `"large"` \| `"extra-large"` | `"default"` | Current text size level |
| reducedMotion | boolean | false (or true if OS `prefers-reduced-motion: reduce`) | Whether animations are disabled |

### TextSize (union type)

Valid text size options: `"default"` | `"large"` | `"extra-large"`

### Storage

- **Key**: `geochat_accessibility_prefs`
- **Format**: JSON string of `AccessibilityPreferences`
- **Location**: `window.localStorage`
- **Fallback**: If localStorage is unavailable, preferences are kept in React state only (lost on reload)

## Relationships

- `AccessibilityPreferences` is consumed by the `AccessibilityProvider` context
- All components read preferences via the `useAccessibility()` hook
- The `<html>` element reflects preferences as `data-contrast`, `data-text-size`, and `data-motion` attributes
- CSS custom properties in `globals.css` respond to these data attributes

## No Database Migration Required
