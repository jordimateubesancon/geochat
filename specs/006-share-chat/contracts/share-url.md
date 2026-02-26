# Contract: Share URL

**Feature**: 006-share-chat
**Date**: 2026-02-26

## URL Format

```
https://<host>/channel/<channel-slug>?c=<conversation-id>
```

### Parameters

| Parameter        | Location | Type   | Required | Description                          |
| ---------------- | -------- | ------ | -------- | ------------------------------------ |
| `channel-slug`   | path     | string | yes      | URL-friendly channel identifier      |
| `c`              | query    | UUID   | no       | Conversation ID to auto-open on load |

### Examples

```
https://geochat.app/channel/hiking?c=a1b2c3d4-e5f6-7890-abcd-ef1234567890
https://geochat.app/channel/climbing?c=f0e1d2c3-b4a5-6789-0abc-def123456789
```

### Behavior When `?c=` Is Present

1. Page loads the channel as normal
2. App fetches the conversation by ID from Supabase
3. Map centers on the conversation's coordinates
4. Conversation panel opens automatically
5. If conversation not found or doesn't belong to channel: show toast error, load channel normally

### Behavior When `?c=` Is Absent

No change from current behavior — the channel page loads normally.

## Share Content Format

### Web Share API (native)

```
title: "<conversation title>"
text: "A conversation on GeoChat at <lat>, <lng>"
url: "<share URL>"
```

### Email (mailto:)

```
subject: "<conversation title> — GeoChat"
body: "Check out this conversation on GeoChat:\n\n<share URL>"
```

### WhatsApp (wa.me)

```
text: "<conversation title> — GeoChat\n<share URL>"
```

### Clipboard (copy link)

```
<share URL>
```
