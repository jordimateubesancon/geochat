# API Contracts: GeoChat MVP

**Date**: 2026-02-23
**Branch**: `001-geochat-mvp`

GeoChat uses Supabase as its backend. All data access goes through the
Supabase client SDK, which provides auto-generated REST endpoints for
table CRUD and RPC calls for custom database functions.

## Table Operations (Supabase Client SDK)

### Create Conversation

**Operation**: `supabase.from('conversations').insert(data)`

**Request payload**:
```json
{
  "id": "uuid (client-generated)",
  "title": "string (1-120 chars, required)",
  "location": "PostGIS geography point (set via RPC or raw SQL)",
  "latitude": 40.7484,
  "longitude": -73.9857,
  "creator_name": "string (required)",
  "message_count": 1,
  "last_message_at": "ISO 8601 timestamp"
}
```

**Response**: The inserted conversation row.

**Errors**:
- 400: Missing required fields or validation failure.
- 403: RLS policy violation.

**Notes**: The `location` geography column may need to be set via a
database function or raw SQL since the Supabase JS client does not
natively construct PostGIS types. Alternative: use a database trigger
that populates `location` from `latitude` and `longitude` on INSERT.

---

### Send Message

**Operation**: `supabase.from('messages').insert(data)`

**Request payload**:
```json
{
  "id": "uuid (client-generated for optimistic updates)",
  "conversation_id": "uuid (required)",
  "author_name": "string (required)",
  "body": "string (1-2000 chars, required)"
}
```

**Response**: The inserted message row.

**Errors**:
- 400: Missing required fields or body exceeds 2000 characters.
- 403: RLS policy violation.
- 409: Duplicate `id` (message already exists — idempotent retry safe).

**Notes**: `created_at` is set server-side via DEFAULT. The client uses
its own timestamp for optimistic display, then reconciles with the
server timestamp from the Realtime subscription.

---

## RPC Functions

### conversations_in_bounds

**Operation**: `supabase.rpc('conversations_in_bounds', params)`

**Parameters**:
```json
{
  "min_lng": -74.05,
  "min_lat": 40.68,
  "max_lng": -73.90,
  "max_lat": 40.82
}
```

**Response**: Array of conversation objects within the bounding box.
```json
[
  {
    "id": "uuid",
    "title": "string",
    "latitude": 40.7484,
    "longitude": -73.9857,
    "creator_name": "string",
    "message_count": 12,
    "last_message_at": "2026-02-23T14:30:00Z",
    "created_at": "2026-02-23T10:00:00Z"
  }
]
```

**Called when**: Map viewport changes (pan/zoom). Debounced on the client
to avoid excessive calls.

---

### conversations_nearby

**Operation**: `supabase.rpc('conversations_nearby', params)`

**Parameters**:
```json
{
  "lng": -73.9857,
  "lat": 40.7484,
  "radius_meters": 1000
}
```

**Response**: Array of conversation objects within the radius.
Same shape as `conversations_in_bounds` response.

**Called when**: User clicks the map to create a conversation. If the
response contains any results, the proximity warning is shown (FR-005a).

---

### messages_for_conversation

**Operation**: `supabase.rpc('messages_for_conversation', params)`

**Parameters**:
```json
{
  "conv_id": "uuid",
  "page_size": 50,
  "before_timestamp": "2026-02-23T14:00:00Z (optional, for pagination)"
}
```

**Response**: Array of message objects, ordered by `created_at DESC`.
```json
[
  {
    "id": "uuid",
    "conversation_id": "uuid",
    "author_name": "string",
    "body": "string",
    "created_at": "2026-02-23T14:30:00Z"
  }
]
```

**Called when**: User opens a conversation (initial load), and when
user scrolls up to load older messages (pagination).

---

## Realtime Subscriptions

### New messages in a conversation

**Channel**: `conv-{conversation_id}`
**Subscription**:
```
postgres_changes, event: INSERT, table: messages,
filter: conversation_id=eq.{conversation_id}
```

**Payload**: Full message row (same shape as messages_for_conversation
response items).

**Client behavior**: Append to message list. Deduplicate against
optimistic messages by matching on `id`.

---

### New and updated conversations on the map

**Channel**: `map-conversations`
**Subscriptions**:
```
postgres_changes, event: INSERT, table: conversations
postgres_changes, event: UPDATE, table: conversations
```

**Payload**: Full conversation row.

**Client behavior**:
- INSERT: Add marker to map if within current viewport bounds.
- UPDATE: Refresh marker display (message count, last_message_at).
