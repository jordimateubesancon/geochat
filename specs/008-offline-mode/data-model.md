# Data Model: Offline Mode

**Feature**: 008-offline-mode
**Date**: 2026-03-03

## Overview

Offline mode introduces client-side persistent storage using IndexedDB (for structured data) and the Cache Storage API (for tile images). No server-side schema changes are needed.

## IndexedDB Schema

### Database: `geochat-offline`

#### Object Store: `channels`

Cached copy of the channel list for offline display.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string (PK) | primary | Channel UUID |
| name | string | — | Channel display name |
| slug | string | unique | URL slug |
| description | string | — | Channel description |
| icon | string | — | Emoji icon |
| sort_order | number | — | Display order |
| is_active | boolean | — | Whether channel is active |
| conversation_count | number | — | Cached conversation count |
| cached_at | number | — | Timestamp when cached (ms) |

#### Object Store: `conversations`

Cached conversation metadata for offline map display.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string (PK) | primary | Conversation UUID |
| channel_id | string | yes | FK to channel |
| title | string | — | Conversation title |
| latitude | number | — | Lat coordinate |
| longitude | number | — | Lng coordinate |
| creator_name | string | — | Display name of creator |
| message_count | number | — | Number of messages |
| last_message_at | string | — | ISO timestamp of last message |
| created_at | string | — | ISO timestamp of creation |
| cached_at | number | — | Timestamp when cached (ms) |

**Indexes**: `channel_id` (for filtering by channel)

#### Object Store: `messages`

Cached messages for conversations the user has opened.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string (PK) | primary | Message UUID |
| conversation_id | string | yes | FK to conversation |
| author_name | string | — | Display name of author |
| body | string | — | Message text |
| created_at | string | — | ISO timestamp |
| cached_at | number | — | Timestamp when cached (ms) |

**Indexes**: `conversation_id` (for loading a conversation's messages)

#### Object Store: `pending_messages`

Messages composed offline, awaiting sync.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string (PK) | primary | Client-generated UUID |
| conversation_id | string | yes | Target conversation |
| author_name | string | — | Sender display name |
| body | string | — | Message text |
| created_at | number | — | Timestamp when composed (ms) |
| status | string | yes | `pending` / `sending` / `failed` |

**Indexes**: `conversation_id`, `status`

**State transitions**:
```
pending → sending → (success: delete from store)
                   → (failure: failed)
failed  → pending  (manual retry)
```

## Cache Storage Schema

### Cache: `map-tiles-v1`

Map tile images cached by the service worker.

| Key | Value | Strategy |
|-----|-------|----------|
| Request URL (`https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`) | Response (opaque, status 0 or 200) | Cache-first |

**Eviction**: LRU-based. When total cache size approaches 50 MB, evict oldest entries. Size is estimated via `navigator.storage.estimate()` or by counting cached entries.

### Cache: `app-shell-v1`

Core app assets for offline launch (HTML, JS, CSS).

| Key | Value | Strategy |
|-----|-------|----------|
| `/` and core route paths | HTML responses | Network-first (stale-while-revalidate) |
| `/_next/static/**` | JS/CSS chunks | Cache-first (immutable, hash-named) |

## Relationships

```
channels (1) ──→ (N) conversations (1) ──→ (N) messages
                                    (1) ──→ (N) pending_messages
```

## Data Flow

### Online → Cache (write-through)
1. Hooks fetch data from Supabase as normal
2. After successful fetch, write results to IndexedDB
3. Service worker caches tile responses transparently

### Offline → Cache (read-through)
1. Hooks detect offline state
2. Instead of Supabase, read from IndexedDB
3. Service worker serves tiles from Cache Storage

### Reconnect → Sync
1. `online` event fires
2. Pending messages sent to Supabase in chronological order
3. Cached data refreshed with latest server data
4. Stale cache entries updated
