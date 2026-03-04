# Feature Specification: Brand Redesign — Logo-Aligned Visual Identity

**Feature Branch**: `012-brand-redesign`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "Align app visual identity with logo: replace blue+gray palette with green gradient primary colors and warm stone neutrals, add heading font, display logo on home page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Green Brand Identity Across All Screens (Priority: P1)

A user opens the app and immediately sees a cohesive green-themed interface that matches the GeoChat logo. The map page, channel selection, chat conversations, and all interactive elements (buttons, links, toggles, focus rings) use green tones derived from the logo's gradient instead of the current blue accent color. The user perceives the app as a unified, nature-oriented product.

**Why this priority**: The color palette is the single most impactful visual change — it transforms every screen at once and establishes the brand identity. Without this, the app looks like a generic blue template disconnected from its own logo.

**Independent Test**: Navigate through all major flows (home → channel → map → open conversation → send message → pin → react → share → settings) and confirm every primary-color element is green instead of blue.

**Acceptance Scenarios**:

1. **Given** the user is on the home page, **When** they hover over channel cards, **Then** interactive accents (border, title text) use green tones, not blue.
2. **Given** the user opens a conversation, **When** they view their own sent messages, **Then** the message bubbles are deep green.
3. **Given** the user is composing a message, **When** they focus on the text input, **Then** the focus ring and border highlight are green.
4. **Given** the user taps the send button, **Then** the button background is green with a darker green on hover.
5. **Given** the user toggles a setting (e.g., high contrast), **Then** the toggle switch uses green when active.
6. **Given** the user has reacted with thumbs-up, **Then** the active reaction indicator uses a green tint.
7. **Given** the user taps a link in another user's message, **Then** the link text is green.
8. **Given** the user opens any dialog (create conversation, link confirmation), **Then** the primary action button is green.

---

### User Story 2 - Warm Neutral Tones Replace Cool Grays (Priority: P2)

A user notices the app's background surfaces, text, borders, and secondary elements use warm-toned grays instead of cool neutral grays, creating a softer, more organic feel that complements the green primary color.

**Why this priority**: The neutral palette is the background canvas that makes the green accents pop. Cool grays clash with warm greens, so switching to warm stone tones is essential for visual harmony.

**Independent Test**: Open any page and confirm backgrounds, borders, placeholder text, and secondary text feel warm-toned rather than cool/clinical.

**Acceptance Scenarios**:

1. **Given** the user is on the home page, **When** they view the page background, **Then** it appears slightly warm (not cool/bluish gray).
2. **Given** the user views the conversation panel, **When** they look at dividers and borders, **Then** the borders are warm gray.
3. **Given** the user reads other people's message bubbles, **Then** the bubble background is a warm off-white.
4. **Given** the user views placeholder text in the message input, **Then** the placeholder color is warm gray.
5. **Given** the user opens any dropdown or popover, **Then** backgrounds and borders use warm neutral tones.

---

### User Story 3 - Branded Typography and Logo Display (Priority: P3)

A user sees the GeoChat logo displayed on the home page above the app title. Headings throughout the app use a distinctive rounded font that echoes the logo's soft curves, differentiating GeoChat from generic apps while remaining highly readable.

**Why this priority**: Typography and logo placement are the finishing touch that makes the brand feel intentional and polished. They're lower priority because the app is fully usable without them — color does the heavy lifting.

**Independent Test**: Open the home page and confirm the logo is visible. Navigate to any page with headings and confirm the heading font is visually distinct from body text.

**Acceptance Scenarios**:

1. **Given** the user opens the home page, **When** they view the header area, **Then** the GeoChat logo is displayed above the title text.
2. **Given** the user reads the "GeoChat" app name on the home page or top bar, **Then** the text uses a rounded, distinctive heading font.
3. **Given** the user opens a dialog (e.g., create conversation), **Then** the dialog title uses the heading font.
4. **Given** the user views the conversation panel header, **Then** the conversation title uses the heading font.
5. **Given** the heading font fails to load, **Then** all headings render in the system font with no layout breakage or flash of unstyled text.

---

### Edge Cases

- What happens in high-contrast accessibility mode? All green and stone colors must be overridden with high-contrast equivalents that maintain minimum 7:1 contrast ratio (WCAG AAA).
- What happens if the heading font fails to load? Body text (system font stack) serves as fallback — the page remains readable and correctly laid out.
- What happens with the logo on very small screens (<320px)? The logo scales down proportionally without breaking layout.
- What happens in dark-themed map tiles? The top bar's frosted glass effect (white/translucent background with backdrop blur) continues to ensure text readability over any map content.
- What happens with existing amber-colored elements (pins, offline banner)? They remain amber — no change, as amber complements the green palette.
- What happens with error states and red elements (thumbs-down reaction, error toasts, failed messages)? They remain red — no change, as red is semantically correct for errors and negative actions.
- What happens to pending (offline) message bubbles? They use a semi-transparent version of the new green, matching the pattern already used for pending messages.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST use a custom green color scale as the primary accent color across all interactive elements (buttons, links, focus rings, toggles, active states, own message bubbles).
- **FR-002**: The system MUST use warm-toned neutral colors for all background surfaces, borders, dividers, secondary text, and placeholder text, replacing the current cool neutral grays.
- **FR-003**: The system MUST display the GeoChat logo image on the home page, positioned above the app title.
- **FR-004**: The system MUST use a distinctive rounded heading font for all major headings: app name, page titles, dialog titles, and panel titles.
- **FR-005**: The system MUST fall back gracefully to the system font stack if the heading font fails to load.
- **FR-006**: The system MUST preserve all existing accessibility features: high-contrast mode, reduced motion, and text size scaling.
- **FR-007**: High-contrast mode MUST update its color overrides to use green-derived tones for own-message bubbles and links instead of the current blue-derived tones.
- **FR-008**: The system MUST NOT change the amber color used for pinned messages and offline indicators.
- **FR-009**: The system MUST NOT change the red color used for error states, failed messages, and thumbs-down reaction highlights.
- **FR-010**: The system MUST define the green color scale in the theme configuration so all components reference consistent brand colors.
- **FR-011**: All color changes MUST maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (WCAG AA).
- **FR-012**: The logo image MUST scale responsively and not break layout on any supported screen size.

### Key Entities

- **Brand Color Scale**: A 10-step green gradient (lightest tint to darkest shade) derived from the logo's color range, used as the primary accent throughout the interface.
- **Neutral Color Scale**: A 10-step warm gray (stone) scale replacing the current cool gray scale, used for backgrounds, borders, and secondary text.
- **Heading Font**: A rounded, friendly typeface applied to headings only, with system font fallback.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of primary interactive elements (buttons, links, toggles, focus states, own message bubbles) display green accent colors instead of blue.
- **SC-002**: 100% of background surfaces, borders, and secondary text use warm-toned neutrals instead of cool grays.
- **SC-003**: The GeoChat logo is visible on the home page on all supported screen sizes (320px to 1920px width).
- **SC-004**: All heading elements (app name, page title, dialog titles, panel titles) render in the branded heading font when the font loads successfully.
- **SC-005**: High-contrast mode passes WCAG AAA (7:1 contrast ratio) for all text elements after the color update.
- **SC-006**: The application builds and passes linting with zero errors after all visual changes.
- **SC-007**: No layout shifts or broken elements observed when navigating all major flows (home, channel map, conversation, settings, dialogs).
- **SC-008**: Font fallback is seamless — if the heading font is blocked, headings render in the system font with no layout breakage.

## Assumptions

- The green color scale values have been designed and documented in the design spec (`specs/012-brand-redesign/design-spec.md`).
- The heading font choice is Nunito (rounded terminals, good weight range, friendly feel). This is a design recommendation that can be adjusted during planning.
- The logo file (`logo.png`) is available and will be placed in the public assets directory.
- No i18n text changes are required — this is a purely visual update.
- Existing functionality (reactions, pins, offline mode, sharing, search, etc.) remains completely unchanged.
- The amber and red color palettes are retained as-is.

## Scope Boundaries

### In Scope
- All color replacements (blue → green, neutral → stone) across every component
- Heading font addition and application
- Logo display on home page
- High-contrast mode CSS updates
- Theme configuration for the new color scale

### Out of Scope
- Dark mode / theme switching
- Logo animation or splash screen
- Favicon or PWA icon updates (can be a follow-up)
- Any functional or behavioral changes
- New components or layout restructuring
