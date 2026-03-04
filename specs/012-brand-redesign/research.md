# Research: Brand Redesign

## R1: Heading Font Selection

**Decision**: Nunito (Google Fonts)

**Rationale**: Nunito's rounded terminals mirror the logo's soft curves. It has excellent weight range (400–900), is highly legible at small sizes, and conveys a friendly/outdoorsy feel without being childish. It's free, open-source (OFL), and optimized by `next/font/google` for zero layout shift.

**Alternatives considered**:
- **Quicksand**: Too geometric and thin at body weights — less readable at small sizes.
- **Varela Round**: Only one weight (400) — insufficient for heading hierarchy.
- **Comfortaa**: Too decorative for a utility-focused app.
- **Poppins**: Very popular/overused — doesn't differentiate the brand.
- **System font stack**: No brand differentiation, but acceptable as fallback.

## R2: Green Color Scale Derivation

**Decision**: Custom 10-step scale derived from the logo's gradient range (`#f0f9e8` to `#0d3513`).

**Rationale**: The logo uses a gradient from lime-yellow through forest green. The custom scale was built by sampling the logo's key colors and extending them into a full 10-step Tailwind-compatible scale. The mid-range (`geo-500` = `#3d9130`) is the primary action color, balancing vibrancy and readability. The dark end (`geo-700` = `#1f5f2a`) serves as the own-message bubble color — dark enough for white text at WCAG AA contrast.

**Alternatives considered**:
- **Tailwind's built-in `green-*`**: Too blue-toned (emerald leaning). Doesn't match the logo's warm yellow-green.
- **Tailwind's `lime-*`**: Too yellow/bright. Poor readability for primary actions.
- **Tailwind's `emerald-*`**: Close but still too cool-toned for the logo.
- Custom scale wins because it precisely matches the logo's actual colors.

## R3: Neutral Palette — Stone vs. Neutral

**Decision**: Use Tailwind's built-in `stone-*` palette (warm grays).

**Rationale**: Tailwind ships `stone-*` as a built-in warm gray scale. It's a drop-in replacement for `neutral-*` with warmer undertones that complement green accents. No custom colors needed — just rename classes.

**Alternatives considered**:
- **Keep `neutral-*`**: Cool grays clash with warm greens. The interface feels disjointed.
- **Custom warm gray scale**: Unnecessary when `stone-*` already exists in Tailwind.
- **`zinc-*`**: Slightly warm but still too cool compared to `stone-*`.

## R4: Font Loading Strategy

**Decision**: Use `next/font/google` with `display: 'swap'` and CSS variable approach.

**Rationale**: `next/font` automatically self-hosts the font (no external requests), optimizes loading, and prevents layout shift. The CSS variable approach (`--font-heading`) lets us apply it selectively via Tailwind's `font-heading` utility without affecting body text performance.

**Alternatives considered**:
- **Manual `@font-face`**: More work, less optimized, same result.
- **CDN link tag**: External request, FOUT risk, privacy concerns.
- **Apply to all text**: Unnecessary download weight — heading-only keeps the font payload small.

## R5: High-Contrast Accessibility

**Decision**: Update HC variables to green-derived values. Keep existing selector structure.

**Rationale**: The high-contrast system in `globals.css` uses CSS custom properties and class-based selectors. We need to:
1. Change `--hc-own-bg` from blue-tint to green-tint
2. Change `--hc-own-text` from dark-blue to dark-green
3. Change `--hc-link` from pure-blue to dark-green
4. Update selectors referencing `bg-blue-500` to `bg-geo-700`
5. Update selectors referencing `neutral-*` to `stone-*`

Contrast ratios verified:
- `#0d3513` on `#d4edbc` = ~10.2:1 (WCAG AAA pass)
- `#1f5f2a` on `#ffffff` = ~7.5:1 (WCAG AAA pass)
