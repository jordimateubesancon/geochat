# Data Model: Safe External Links

**Feature**: 009-safe-external-links
**Date**: 2026-03-04

## Overview

This feature requires **no database changes**. All link detection and rendering happens client-side at display time. The existing `Message` entity is unchanged.

## Client-Side Types

### TextSegment

Represents a parsed segment of message text after URL detection.

| Field | Type | Description |
|-------|------|-------------|
| type | `"text"` \| `"link"` | Whether this segment is plain text or a detected URL |
| value | string | The text content (plain text or URL string) |

### Usage

- Input: `Message.body` (string)
- Output: `TextSegment[]` from `parseLinks()` utility
- Consumed by: `<LinkifiedText>` component for rendering

## Existing Entity (unchanged)

### Message

| Field | Type | Notes |
|-------|------|-------|
| id | string | Primary key |
| conversation_id | string | FK to conversations |
| author_name | string | Display name |
| body | string | Plain text — link detection applied at render time |
| created_at | string | ISO timestamp |

No schema migration required.
