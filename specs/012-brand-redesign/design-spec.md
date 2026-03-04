# GeoChat Brand Redesign — Design Specification

## Logo Analysis

The GeoChat logo communicates a clear identity:

- **Map pin silhouette** in rich green gradients — the core shape
- **Mountain landscape** inside the pin — outdoor/nature context
- **Chat bubble** with green activity dot — communication overlay
- **Elliptical green shadow** beneath — grounded, tangible feel
- **Color range**: lime-yellow `#c6e944` through forest `#2d7a3a` to deep `#1a5c2a`
- **Style**: Modern, slightly glossy, clean edges with soft gradients

**Current gap**: The app uses a neutral gray palette with blue accents (`blue-500`/`blue-600`). There is zero visual connection to the logo's green, nature-inspired identity.

---

## Aesthetic Direction

**Tone**: Fresh alpine — clean and functional like a trail map, with the warmth of sunlit meadows. Not dark/moody, not corporate. Think: a well-designed outdoor gear app.

**Differentiation**: The green gradient system mirrors the logo's own gradient range, making the brand feel cohesive from icon to interface.

---

## 1. Color Palette

### Primary — Green Scale (from logo)

| Token | Hex | Usage |
|-------|-----|-------|
| `--geo-50` | `#f0f9e8` | Lightest background tint (page bg, hover states) |
| `--geo-100` | `#d4edbc` | Light background (input fields, secondary cards) |
| `--geo-200` | `#a8d87a` | Borders on hover, subtle accents |
| `--geo-300` | `#7fc44e` | Active borders, secondary buttons |
| `--geo-400` | `#5aad35` | Icons, secondary text emphasis |
| `--geo-500` | `#3d9130` | **Primary action** (send button, active tabs, links) |
| `--geo-600` | `#2d7a3a` | Hover on primary actions |
| `--geo-700` | `#1f5f2a` | **Own message bubbles** |
| `--geo-800` | `#164a1f` | Heavy emphasis text on green backgrounds |
| `--geo-900` | `#0d3513` | Darkest green, sparingly used |

### Neutral — Warm Slate (replace pure gray)

Shift the neutral scale from cool `neutral-*` to a slightly warm stone tone, so cards and text don't fight the greens:

| Token | Tailwind equivalent | Hex | Usage |
|-------|---------------------|-----|-------|
| `--stone-50` | `stone-50` | `#fafaf9` | Page background |
| `--stone-100` | `stone-100` | `#f5f5f4` | Card backgrounds, input bg |
| `--stone-200` | `stone-200` | `#e7e5e4` | Borders, dividers |
| `--stone-300` | `stone-300` | `#d6d3d1` | Inactive borders |
| `--stone-400` | `stone-400` | `#a8a29e` | Placeholder text |
| `--stone-500` | `stone-500` | `#78716c` | Secondary text |
| `--stone-600` | `stone-600` | `#57534e` | Body text, icons |
| `--stone-700` | `stone-700` | `#44403c` | Headings |
| `--stone-800` | `stone-800` | `#292524` | Primary text |
| `--stone-900` | `stone-900` | `#1c1917` | Maximum emphasis |

### Accent — Amber (kept, already used for pins)

No change to amber scale — it already works well for pinned messages and offline indicators, and the warm yellow complements the greens.

### Error — Red (kept)

No change to red scale for error states.

### Semantic Mapping (current → new)

| Element | Current | New |
|---------|---------|-----|
| Primary button bg | `bg-blue-600` | `bg-geo-500` |
| Primary button hover | `hover:bg-blue-500` | `hover:bg-geo-600` |
| Own message bubble | `bg-blue-500` | `bg-geo-700` |
| Own message text | `text-white` | `text-white` (unchanged) |
| Own message timestamp | `text-blue-100` | `text-geo-200` (light green) |
| Other message bubble | `bg-neutral-100` | `bg-stone-100` |
| Other message text | `text-neutral-900` | `text-stone-800` |
| Focus ring | `ring-blue-500` | `ring-geo-400` |
| Focus border | `border-blue-500` | `border-geo-400` |
| Link color | `text-blue-600` | `text-geo-500` |
| Link hover | `text-blue-800` | `text-geo-700` |
| Active reaction (up) | `bg-blue-100 text-blue-600` | `bg-geo-100 text-geo-600` |
| Channel card hover border | `hover:border-blue-300` | `hover:border-geo-300` |
| Channel card hover text | `group-hover:text-blue-700` | `group-hover:text-geo-600` |
| Page background | `bg-neutral-50` | `bg-stone-50` |
| Card background | `bg-white` | `bg-white` (unchanged) |
| Borders | `border-neutral-200` | `border-stone-200` |
| Secondary text | `text-neutral-500` | `text-stone-500` |
| Primary text | `text-neutral-900` | `text-stone-800` |
| Placeholder text | `text-neutral-400` | `text-stone-400` |
| Icon color | `text-neutral-600` | `text-stone-600` |

---

## 2. Typography

**Current**: System default (Tailwind antialiased, no custom fonts).

**Proposed**: Add a single Google Font for headings to give the app character without loading multiple fonts.

| Role | Font | Weight | Fallback |
|------|------|--------|----------|
| **Headings** (h1, h2, app name) | **Nunito** | 700, 800 | `sans-serif` |
| **Body** (messages, labels, inputs) | System stack | 400, 500, 600 | Tailwind default |

**Why Nunito**: Rounded terminals echo the logo's soft curves. It's legible at small sizes, has excellent weight range, and feels friendly/outdoorsy without being childish. It's distinctive without being eccentric.

**Implementation**: Add `Nunito` via `next/font/google` in layout.tsx. Apply as a CSS variable `--font-heading` and use it on headings only. Body text stays on system stack for performance and familiarity.

---

## 3. Component-Level Changes

### 3.1 Home Page (`page.tsx`)

- Background: `bg-stone-50` (was `bg-neutral-50`)
- Add logo image above "GeoChat" title (small, ~48px)
- Title "GeoChat": Use Nunito 800, `text-stone-800`
- Subtitle: `text-stone-500`

### 3.2 Channel Card (`channel-card.tsx`)

- Border: `border-stone-200` → `hover:border-geo-300`
- Title hover: `group-hover:text-geo-600`
- Description: `text-stone-500`
- Meta: `text-stone-400`
- Left accent: Add a `border-l-4 border-transparent group-hover:border-geo-400` for a subtle branded edge

### 3.3 Top Bar (`top-bar.tsx`)

- Background: `bg-white/80 backdrop-blur-sm` (keep glass effect)
- App name "GeoChat": Nunito bold, `text-stone-900`
- Channel name: `text-stone-700`
- Divider: `text-stone-400`
- User icon + name: `text-stone-500`
- Borders: `border-stone-200/60`
- Icon buttons: `text-stone-600 hover:bg-stone-100`

### 3.4 Message Bubbles (`message-list.tsx`)

**Own messages**:
- Background: `bg-geo-700` (deep forest green) — most impactful brand change
- Text: `text-white`
- Timestamp: `text-geo-200`
- Links: `text-white underline hover:text-geo-100`

**Other messages**:
- Background: `bg-stone-100`
- Text: `text-stone-800`
- Author: `text-stone-600 font-semibold`
- Timestamp: `text-stone-500`
- Links: `text-geo-500 underline hover:text-geo-700`

**Pending messages**:
- Background: `bg-geo-700/60` (was `bg-blue-500/60`)

### 3.5 Message Input (`message-input.tsx`)

- Container bg: `bg-stone-50`
- Border: `border-stone-200`
- Input border: `border-stone-300`
- Focus state: `focus:border-geo-400 focus:ring-geo-400`
- Send button: `bg-geo-500 hover:bg-geo-600 text-white`

### 3.6 Conversation Panel (`conversation-panel.tsx`)

- Borders: `border-stone-200`
- Title: `text-stone-900` (Nunito)
- Meta text: `text-stone-400`
- Close button: `text-stone-500 hover:bg-stone-100 hover:text-stone-800`

### 3.7 Reaction Buttons (`reaction-buttons.tsx`)

- Active thumbs up: `bg-geo-100 text-geo-600` (was blue)
- Active thumbs down: `bg-red-100 text-red-600` (keep — red makes semantic sense)
- Inactive: `bg-stone-100 text-stone-500 hover:bg-stone-200`

### 3.8 Pinned Messages (`pinned-messages.tsx`)

- Keep amber palette — it works as a distinct "highlight" color that contrasts nicely with the green primary

### 3.9 Accessibility Settings Panel (`accessibility-settings-panel.tsx`)

- Toggle active: `bg-geo-500` (was `bg-blue-500`)
- Text size active button: `bg-geo-500 text-white`
- Text size inactive: `bg-stone-100 text-stone-700 hover:bg-stone-200`
- Reset button: `border-stone-300 text-stone-700 hover:bg-stone-50`

### 3.10 Create Dialog (`create-dialog.tsx`)

- Create button: `bg-geo-500 hover:bg-geo-600`
- Cancel button: `bg-stone-100 text-stone-700 hover:bg-stone-200`
- Input focus: `focus:border-geo-400 focus:ring-geo-400`
- Location badge bg: `bg-stone-100`

### 3.11 Share Button & Dropdown (`share-button.tsx`)

- Dropdown border: `border-stone-200`
- Menu items: `text-stone-700 hover:bg-stone-50`

### 3.12 Offline Indicator (`offline-indicator.tsx`)

- Keep `bg-amber-500` — works as warning color

### 3.13 Toast Notifications

- Info toast: `bg-white/90 border-stone-200 text-stone-800`
- Error toast: `bg-red-50/90 border-red-200 text-red-800` (keep)

### 3.14 Link Confirmation Dialog

- URL box: `bg-stone-100`
- Continue button: `bg-geo-500 hover:bg-geo-600`

---

## 4. High Contrast Mode Updates

Update the CSS custom properties in `globals.css`:

```css
[data-contrast="high"] {
  --hc-bg: #ffffff;
  --hc-text: #000000;
  --hc-border: #000000;
  --hc-own-bg: #d4edbc;       /* was #e0f0ff — now light green */
  --hc-own-text: #0d3513;     /* was #1e3a5f — now dark green */
  --hc-other-bg: #ffffff;
  --hc-other-text: #000000;
  --hc-link: #1f5f2a;         /* was #0000ee — now dark green */
}
```

Also update the CSS selectors that reference `bg-blue-500` to also match the new `bg-geo-700` class for own message bubbles.

---

## 5. Tailwind Configuration

Extend `tailwind.config.ts` to add the `geo` color scale:

```typescript
theme: {
  extend: {
    colors: {
      geo: {
        50:  '#f0f9e8',
        100: '#d4edbc',
        200: '#a8d87a',
        300: '#7fc44e',
        400: '#5aad35',
        500: '#3d9130',
        600: '#2d7a3a',
        700: '#1f5f2a',
        800: '#164a1f',
        900: '#0d3513',
      },
    },
    fontFamily: {
      heading: ['var(--font-heading)', 'sans-serif'],
    },
  },
},
```

---

## 6. Implementation Strategy

### Phase 1 — Foundation (non-breaking)
1. Add `geo` color scale to Tailwind config
2. Add Nunito font via `next/font/google` in layout.tsx
3. Add logo to `/public/` and update `page.tsx` header

### Phase 2 — Neutral swap (global find-replace)
4. Replace `neutral-*` with `stone-*` across all components
5. Update `globals.css` high-contrast selectors for stone classes

### Phase 3 — Green accent swap
6. Replace `blue-500`/`blue-600` with `geo-500`/`geo-600`/`geo-700` in:
   - Own message bubbles
   - Send button and primary action buttons
   - Focus rings and borders
   - Active toggle/tab states
   - Link colors
   - Reaction active states
7. Update high-contrast mode CSS for new class names

### Phase 4 — Typography
8. Apply `font-heading` to: app name, page title, dialog titles, panel title
9. Verify all heading sizes still look balanced with Nunito

### Phase 5 — Polish
10. Update i18n (no text changes needed — purely visual)
11. Verify accessibility: high contrast, reduced motion, text scaling
12. Test on mobile and desktop breakpoints
13. Run `npm run lint && npm run build`

---

## 7. Files Changed (estimated)

| File | Change type |
|------|-------------|
| `tailwind.config.ts` | Add geo colors + font-heading |
| `src/app/layout.tsx` | Add Nunito font |
| `src/app/globals.css` | Update high-contrast selectors |
| `src/app/page.tsx` | Logo, bg color, font |
| `src/components/top-bar.tsx` | Colors + font |
| `src/components/channel-card.tsx` | Colors |
| `src/components/channel-grid.tsx` | Colors |
| `src/components/message-list.tsx` | Own bubble color, neutrals |
| `src/components/message-input.tsx` | Button + focus colors |
| `src/components/conversation-panel.tsx` | Neutral swap |
| `src/components/reaction-buttons.tsx` | Active reaction color |
| `src/components/reaction-popover.tsx` | Neutral swap |
| `src/components/pinned-messages.tsx` | Neutral swap only |
| `src/components/accessibility-settings-panel.tsx` | Toggle + button colors |
| `src/components/create-dialog.tsx` | Button + focus colors |
| `src/components/share-button.tsx` | Neutral swap |
| `src/components/linkified-text.tsx` | Link colors |
| `src/components/link-confirmation-dialog.tsx` | Button + neutral swap |
| `src/components/offline-indicator.tsx` | No change (keeps amber) |
| `src/components/toast.tsx` | Neutral swap on info toast |
| `src/components/toolbox.tsx` | Neutral swap |
| `src/components/nearby-warning.tsx` | Neutral swap + button |
| `public/logo.png` | Copy logo to public |

**~22 files**, mostly mechanical color replacements with a few structural additions (font, logo, Tailwind config).

---

## 8. What Stays the Same

- Layout structure and spacing
- Animation behavior and transitions
- Accessibility features (high contrast, reduced motion, text scaling)
- Z-index hierarchy
- Responsive breakpoints
- All functionality (reactions, pins, offline, share, etc.)
- Amber for pins/offline (complementary to green)
- Red for errors and thumbs-down reactions
- Shadow scale (sm/lg/xl/2xl)

---

## 9. Visual Summary

```
BEFORE                          AFTER
─────────────────────          ─────────────────────
Gray + Blue                    Warm Stone + Forest Green

Page bg:   neutral-50          Page bg:   stone-50
Cards:     neutral borders     Cards:     stone borders, green hover
Buttons:   blue-600            Buttons:   geo-500
Bubbles:   blue-500            Bubbles:   geo-700 (deep green)
Text:      neutral grays       Text:      warm stone grays
Links:     blue-600            Links:     geo-500
Focus:     blue ring           Focus:     green ring
Headings:  system font         Headings:  Nunito (rounded, friendly)
Logo:      absent from UI      Logo:      present on home page
```
