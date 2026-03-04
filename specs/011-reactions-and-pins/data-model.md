# Data Model: Message Reactions & Personal Pins

**Feature**: 011-reactions-and-pins
**Date**: 2026-03-04

## Entities

### MessageReaction (server-side, Supabase)

| Field            | Type        | Constraints                                         |
|------------------|-------------|-----------------------------------------------------|
| id               | UUID        | Primary key, auto-generated                         |
| message_id       | UUID        | FK → messages(id) ON DELETE CASCADE, NOT NULL        |
| conversation_id  | UUID        | FK → conversations(id) ON DELETE CASCADE, NOT NULL   |
| user_session_id  | TEXT        | NOT NULL, identifies the anonymous user              |
| user_name        | TEXT        | NOT NULL, display name at time of reaction           |
| reaction_type    | TEXT        | NOT NULL, CHECK IN ('thumbs_up', 'thumbs_down')     |
| created_at       | TIMESTAMPTZ | NOT NULL, DEFAULT now()                              |

**Unique constraint**: (message_id, user_session_id) — one reaction per user per message.

**Indexes**:
- `message_reactions_message_id_idx` ON (message_id) — for aggregating counts per message
- `message_reactions_conversation_id_idx` ON (conversation_id) — for real-time subscription filtering

**RLS policies** (anon role):
- SELECT: Allow all (reactions are public)
- INSERT: Allow all (any anonymous user can react)
- UPDATE: Allow where `user_session_id` matches request header or parameter
- DELETE: Allow where `user_session_id` matches request header or parameter

### Pin (client-side, localStorage)

Stored as a JSON object in localStorage under key `geochat_pins`.

```
{
  "<conversation_id>": {
    "<message_id>": {
      "author_name": "BraveWolf",
      "body": "Meet at the summit at 10am...",
      "created_at": "2026-03-04T10:00:00Z",
      "pinned_at": "2026-03-04T12:00:00Z"
    },
    ...
  },
  ...
}
```

**Constraints**:
- Maximum 3 entries per conversation (enforced client-side)
- Tied to session ID (if session is lost, pins are lost)
- Body stored truncated (first 100 characters) for preview display

### PendingReaction (client-side, IndexedDB)

Stored in a new `pending_reactions` object store for offline support.

| Field            | Type   | Description                                    |
|------------------|--------|------------------------------------------------|
| id               | STRING | Composite key: `${message_id}_${session_id}`   |
| message_id       | STRING | Target message UUID                            |
| conversation_id  | STRING | Parent conversation UUID                       |
| user_session_id  | STRING | Anonymous user session ID                      |
| user_name        | STRING | Display name at time of reaction               |
| reaction_type    | STRING | 'thumbs_up', 'thumbs_down', or 'remove'       |
| status           | STRING | 'pending', 'sending', 'failed'                |
| cached_at        | NUMBER | Timestamp for staleness detection              |

**Indexes**: conversation_id, status

## Relationships

```
conversations (1) ──── (N) messages (1) ──── (N) message_reactions
                                          │
                                          └── (0..3) pins (client-side, per user)
```

## State Transitions

### Reaction Lifecycle
```
[No reaction] ──tap thumbs_up──→ [thumbs_up]
[thumbs_up]   ──tap thumbs_up──→ [No reaction]  (toggle off)
[thumbs_up]   ──tap thumbs_down→ [thumbs_down]  (switch)
[thumbs_down] ──tap thumbs_down→ [No reaction]  (toggle off)
[thumbs_down] ──tap thumbs_up──→ [thumbs_up]    (switch)
```

### Pin Lifecycle
```
[Unpinned] ──tap pin (count < 3)──→ [Pinned]
[Unpinned] ──tap pin (count = 3)──→ [Error: max reached]
[Pinned]   ──tap unpin───────────→ [Unpinned]
[Pinned]   ──message deleted─────→ [Auto-unpinned]
```
