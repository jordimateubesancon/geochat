# Data Model: Share Chat

**Feature Branch**: `006-share-chat`
**Date**: 2026-02-26

## Schema Changes

**None.** This feature requires no database changes. Sharing is purely a client-side feature that constructs URLs from existing conversation data.

## Entities Used (existing)

### Conversation (read-only)

| Field         | Type     | Used For                                    |
| ------------- | -------- | ------------------------------------------- |
| id            | UUID     | Included in share URL as `?c=` param        |
| title         | string   | Share text title                             |
| latitude      | number   | Share text location description              |
| longitude     | number   | Share text location description              |
| channel_id    | UUID     | Used to validate conversation belongs to channel on deep link |

### Channel (read-only)

| Field | Type   | Used For                          |
| ----- | ------ | --------------------------------- |
| slug  | string | Part of the share URL path        |

## URL Structure

```
https://<host>/channel/<slug>?c=<conversation-id>
```

Example:
```
https://geochat.app/channel/hiking?c=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## Client-Side State

No new persistent state. The share dropdown open/closed state is ephemeral component state (`useState<boolean>`).
