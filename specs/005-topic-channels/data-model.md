# Data Model: Topic Channels

**Feature**: 005-topic-channels
**Date**: 2026-02-25

## New Entity: Channel

| Field       | Type                     | Constraints                        | Description                              |
|-------------|--------------------------|------------------------------------|------------------------------------------|
| id          | UUID                     | PK, default gen_random_uuid()      | Unique identifier                        |
| name        | TEXT                     | NOT NULL, max 60 chars, UNIQUE     | Display name (e.g., "Skimo")             |
| slug        | TEXT                     | NOT NULL, max 60 chars, UNIQUE     | URL-safe identifier (e.g., "skimo")      |
| description | TEXT                     | NOT NULL, max 280 chars            | Short description of the channel         |
| icon        | TEXT                     | NULL                               | Emoji or icon identifier (optional)      |
| sort_order  | INTEGER                  | NOT NULL, default 0                | Display ordering on selection screen     |
| is_active   | BOOLEAN                  | NOT NULL, default TRUE             | Whether channel is visible to users      |
| created_at  | TIMESTAMPTZ              | NOT NULL, default now()            | Creation timestamp                       |

**Indexes**:
- `channels_slug_idx` UNIQUE on `slug` (for URL lookups)
- `channels_sort_order_idx` on `sort_order, name` (for ordered listing)

**RLS Policies**:
- SELECT: Allow all (anonymous read access)
- INSERT/UPDATE/DELETE: Deny all (admin-only via service key or dashboard)

## Modified Entity: Conversation

| Field      | Type | Constraints                              | Description                     |
|------------|------|------------------------------------------|---------------------------------|
| channel_id | UUID | NOT NULL, FK → channels(id) ON DELETE CASCADE | Channel this conversation belongs to |

**New Index**:
- `conversations_channel_id_idx` on `channel_id` (for filtered queries)

## Entity Relationships

```
Channel (1) ──────< (N) Conversation (1) ──────< (N) Message
```

- A **Channel** has zero or more **Conversations**
- A **Conversation** belongs to exactly one **Channel** (mandatory)
- A **Conversation** has zero or more **Messages** (unchanged)
- Deleting a Channel cascades to its Conversations (and then to Messages)

## Migration Strategy

1. Create `channels` table
2. Seed initial channels (General, Skimo, Rock Climbing, Trail Running, Hiking, Mountain Biking)
3. Add `channel_id` column to `conversations` as NULLABLE initially
4. Set all existing conversations to the "General" channel
5. Alter `channel_id` to NOT NULL
6. Add foreign key constraint and index
7. Update RPC functions (`conversations_in_bounds`, `conversations_nearby`) to accept and filter by `channel_id`

## Seed Data

| name             | slug              | description                                           | icon | sort_order |
|------------------|-------------------|-------------------------------------------------------|------|------------|
| General          | general           | General outdoor discussions and meetups                | 🌍   | 0          |
| Skimo            | skimo             | Ski mountaineering routes, conditions, and partners    | ⛷️   | 1          |
| Rock Climbing    | rock-climbing     | Climbing spots, beta, and belay partners               | 🧗   | 2          |
| Trail Running    | trail-running     | Trail routes, races, and running groups                | 🏃   | 3          |
| Hiking           | hiking            | Hiking trails, conditions, and group hikes             | 🥾   | 4          |
| Mountain Biking  | mountain-biking   | MTB trails, bike parks, and riding groups              | 🚵   | 5          |

## Derived Data

**Conversation count per channel**: Computed at query time via `COUNT(*)` joined or subquery. Not denormalized — channel list is small and infrequently loaded.

## State Transitions

Channels have no state transitions in V1 — they are static, admin-managed entities. The `is_active` flag allows soft-disabling a channel without deleting it.
