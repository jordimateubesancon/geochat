# Quickstart: Brand Redesign Verification

## Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- Development server running (`npm run dev`)

## Verification Scenarios

### Scenario 1: Green Accent Colors

1. Open `http://localhost:3000`
2. Hover over a channel card → border and title should turn green (not blue)
3. Click a channel to open the map
4. Open a conversation
5. Send a message → own bubble should be deep green
6. Tap the message input → focus ring should be green
7. Tap the send button → button should be green
8. Toggle thumbs-up reaction → active state should have green tint
9. Open Settings (gear icon) → active toggles should be green

**Expected**: Every element that was previously blue is now green.

### Scenario 2: Warm Neutral Tones

1. On the home page, observe the background → slightly warm, not cool gray
2. Open a conversation → other people's message bubbles should be warm off-white
3. Look at borders and dividers → warm gray tone
4. Check placeholder text in the message input → warm gray

**Expected**: The entire interface feels warmer, not clinical.

### Scenario 3: Logo and Typography

1. On the home page → logo should appear above "GeoChat" title
2. "GeoChat" text should be in a rounded font (Nunito), distinct from body text
3. Open a conversation → panel title should use the heading font
4. Open create dialog → dialog title should use the heading font

**Expected**: Headings are visually distinct. Logo is displayed at appropriate size.

### Scenario 4: Accessibility — High Contrast

1. Open Settings → enable High Contrast mode
2. Own message bubbles should have green-tinted background with dark green text
3. Links should be dark green
4. All text should remain high-contrast (7:1 ratio)
5. Borders should be solid black on all interactive elements

**Expected**: High contrast mode works with green palette, no readability issues.

### Scenario 5: Accessibility — Text Scaling

1. Open Settings → set text size to "Large" then "Extra Large"
2. Verify layout doesn't break at larger sizes
3. Verify logo scales appropriately
4. Verify heading font remains readable

**Expected**: All size modes work correctly.

### Scenario 6: Build Verification

```bash
npm run lint
npm run build
```

**Expected**: Zero errors, zero warnings related to the changes.
