# Supabase RPC Contracts: Topic Channels

**Feature**: 005-topic-channels
**Date**: 2026-02-25

## Modified RPCs

### conversations_in_bounds

Existing RPC updated to accept and filter by channel.

**Parameters**:
| Name     | Type             | Required | Description                    |
|----------|------------------|----------|--------------------------------|
| min_lng  | DOUBLE PRECISION | Yes      | Bounding box west longitude    |
| min_lat  | DOUBLE PRECISION | Yes      | Bounding box south latitude    |
| max_lng  | DOUBLE PRECISION | Yes      | Bounding box east longitude    |
| max_lat  | DOUBLE PRECISION | Yes      | Bounding box north latitude    |
| p_channel_id | UUID         | Yes      | Channel to filter by           |

**Returns**: Same as current (all conversation columns) filtered to the given channel.

**Behavior change**: Adds `WHERE channel_id = p_channel_id` to the existing spatial query.

---

### conversations_nearby

Existing RPC updated to accept and filter by channel.

**Parameters**:
| Name          | Type             | Required | Description                |
|---------------|------------------|----------|----------------------------|
| lng           | DOUBLE PRECISION | Yes      | Center longitude           |
| lat           | DOUBLE PRECISION | Yes      | Center latitude            |
| radius_meters | DOUBLE PRECISION | Yes      | Search radius in meters    |
| p_channel_id  | UUID             | Yes      | Channel to filter by       |

**Returns**: Same as current (nearby conversations) filtered to the given channel.

**Behavior change**: Adds `WHERE channel_id = p_channel_id` to the existing proximity query.

## New Queries

### Fetch all active channels (direct query, not RPC)

```
supabase
  .from('channels')
  .select('*, conversation_count:conversations(count)')
  .eq('is_active', true)
  .order('sort_order', { ascending: true })
```

**Returns**: Array of channels with embedded conversation count.

### Fetch channel by slug (direct query, not RPC)

```
supabase
  .from('channels')
  .select('*')
  .eq('slug', slug)
  .eq('is_active', true)
  .single()
```

**Returns**: Single channel object or null.

## TypeScript Interfaces

```typescript
interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Updated - adds channel_id
interface Conversation {
  id: string;
  channel_id: string;  // NEW
  title: string;
  latitude: number;
  longitude: number;
  creator_name: string;
  message_count: number;
  last_message_at: string;
  created_at: string;
}
```
