# Quickstart: OpenTopoMap Layer & Light Theme

**Feature**: 002-opentopomap-light-theme

## Verification Steps

After implementation, verify the following:

### 1. Map Tiles

1. Run `npm run dev` and open `http://localhost:3000`
2. Verify the map shows OpenTopoMap tiles (topographic features: contour lines, elevation coloring, trails)
3. Pan and zoom across different areas — tiles should load at all zoom levels up to 17
4. Check the bottom-right attribution includes "OpenTopoMap" and "OpenStreetMap contributors"

### 2. Light Theme - Layout

1. Verify the page background is white/light (not dark)
2. Verify the top bar has a light semi-transparent background with dark text
3. Verify "GeoChat" title and display name are readable

### 3. Light Theme - Conversation Panel

1. Click a conversation marker (or create one)
2. Verify the conversation panel has a light background
3. Verify message bubbles: own messages in blue, others in light gray
4. Verify all text (author names, timestamps, message body) is readable on light background
5. Verify the message input area has appropriate light styling

### 4. Light Theme - Dialogs

1. Click an empty area on the map to trigger the create flow
2. Verify the create dialog has light theme styling
3. Verify input fields, labels, and buttons are readable
4. If nearby conversations exist, verify the nearby warning dialog is also light-themed

### 5. Light Theme - Toasts

1. Trigger a toast notification (e.g., disconnect from internet briefly)
2. Verify info toasts use light styling
3. Verify error toasts are visually distinct (red-tinted)

### 6. Existing Functionality

1. Create a new conversation — verify it appears on the map
2. Send messages — verify optimistic updates and realtime sync
3. Open in two tabs — verify realtime message and marker sync
4. Resize to mobile width (375px) — verify responsive layout still works

## Project Structure (modified files)

```text
src/
├── app/
│   └── layout.tsx              # Light theme body classes
├── components/
│   ├── map-inner.tsx           # OpenTopoMap tiles + light placeholder
│   ├── conversation-panel.tsx  # Light theme classes
│   ├── message-list.tsx        # Light theme classes
│   ├── message-input.tsx       # Light theme classes
│   ├── create-dialog.tsx       # Light theme classes
│   ├── nearby-warning.tsx      # Light theme classes
│   ├── top-bar.tsx             # Light semi-transparent background
│   ├── toast.tsx               # Light theme classes
│   └── marker.tsx              # Light tooltip text
tailwind.config.ts              # Optional: remove darkMode config
```
