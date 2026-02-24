# Data Model: GeoChat MVP

**Date**: 2026-02-23
**Branch**: `001-geochat-mvp`

## Entities

### conversations

A discussion anchored to a specific geographic point.

| Column       | Type                      | Constraints                     | Description                        |
|--------------|---------------------------|---------------------------------|------------------------------------|
| id           | UUID                      | PK, DEFAULT gen_random_uuid()   | Unique conversation identifier     |
| title        | TEXT                      | NOT NULL, max 120 chars         | Conversation topic/title           |
| location     | GEOGRAPHY(Point, 4326)    | NOT NULL                        | Geographic coordinates             |
| latitude     | DOUBLE PRECISION          | NOT NULL                        | Latitude (convenience column)      |
| longitude    | DOUBLE PRECISION          | NOT NULL                        | Longitude (convenience column)     |
| creator_name | TEXT                      | NOT NULL                        | Display name of the creator        |
| message_count| INTEGER                   | NOT NULL, DEFAULT 0             | Denormalized total message count   |
| last_message_at | TIMESTAMPTZ            | NULL                            | Timestamp of most recent message   |
| created_at   | TIMESTAMPTZ               | NOT NULL, DEFAULT now()         | Creation timestamp                 |

**Indexes**:
- `conversations_location_idx` — GiST index on `location` for spatial queries
- `conversations_created_at_idx` — B-tree on `created_at` for ordering

**Notes**:
- `latitude` and `longitude` are denormalized from `location` for
  convenience in non-spatial queries and client consumption.
- `message_count` and `last_message_at` are denormalized for marker display
  (FR-003: markers show message count + relative timestamp). Updated via
  database trigger on message INSERT.
- RLS enabled. Policy: allow all reads and inserts for V1.

---

### messages

A single contribution to a conversation.

| Column          | Type          | Constraints                     | Description                        |
|-----------------|---------------|---------------------------------|------------------------------------|
| id              | UUID          | PK, DEFAULT gen_random_uuid()   | Unique message identifier          |
| conversation_id | UUID          | NOT NULL, FK → conversations.id | Parent conversation                |
| author_name     | TEXT          | NOT NULL                        | Display name of the author         |
| body            | TEXT          | NOT NULL, max 2000 chars        | Message content                    |
| created_at      | TIMESTAMPTZ   | NOT NULL, DEFAULT now()         | Creation timestamp                 |

**Indexes**:
- `messages_conversation_id_created_at_idx` — Composite B-tree on
  `(conversation_id, created_at DESC)` for paginated message loading

**Notes**:
- No `updated_at` — messages are immutable in V1 (no editing).
- RLS enabled. Policy: allow all reads; allow inserts for V1.
- On INSERT, a trigger updates `conversations.message_count` and
  `conversations.last_message_at`.

---

## Relationships

```text
conversations 1 ──── * messages
  (id)                  (conversation_id)
```

- One conversation has many messages.
- A message belongs to exactly one conversation.
- Deleting a conversation cascades to its messages (future concern;
  no delete functionality in V1).

## Client-Side State

### User Session (browser storage)

Not stored in the database. Persisted in `localStorage`.

| Key            | Type   | Description                              |
|----------------|--------|------------------------------------------|
| display_name   | string | Randomly generated on first visit        |
| session_id     | string | UUID for deduplication / future identity  |

**Notes**:
- Generated on first visit, persisted until storage is cleared.
- `session_id` is included in message inserts to allow the client to
  identify its own messages for visual distinction (FR-008) and
  optimistic update deduplication.

## Database Functions (RPC)

### conversations_in_bounds

Returns conversations visible in the current map viewport.

**Parameters**: `min_lng`, `min_lat`, `max_lng`, `max_lat` (all FLOAT)
**Returns**: Set of conversation rows within the bounding box.

### conversations_nearby

Returns conversations within a given radius of a point. Used for the
proximity warning (FR-005a).

**Parameters**: `lng`, `lat` (FLOAT), `radius_meters` (FLOAT, default 1000)
**Returns**: Set of conversation rows within the radius.

### messages_for_conversation

Returns paginated messages for a conversation, most recent first.

**Parameters**: `conv_id` (UUID), `page_size` (INTEGER, default 50),
`before_timestamp` (TIMESTAMPTZ, optional — for cursor-based pagination)
**Returns**: Set of message rows ordered by `created_at DESC`.

## Triggers

### update_conversation_stats

**Event**: AFTER INSERT on `messages`
**Action**: Increments `message_count` and sets `last_message_at` on the
parent conversation row.

## Realtime Subscriptions

| Channel pattern          | Table          | Event  | Filter                          | Purpose                          |
|--------------------------|----------------|--------|---------------------------------|----------------------------------|
| `conv-{id}`              | messages       | INSERT | `conversation_id=eq.{id}`       | New messages in open conversation|
| `map-conversations`      | conversations  | INSERT | None                            | New conversation markers on map  |
| `map-conversations`      | conversations  | UPDATE | None                            | Updated activity on markers      |
