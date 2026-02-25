# Contract: Chat Title Search

**Feature Branch**: `004-chat-title-search`
**Date**: 2026-02-25

## Supabase Query Contract

This feature queries the existing `conversations` table. No new endpoints or RPC functions.

### Query: Search Conversations by Title

```
supabase.from("conversations").select("*").ilike("title", "%{query}%").limit(10).order("created_at", { ascending: false })
```

### Parameters

| Parameter | Type | Constraint | Description |
|-----------|------|------------|-------------|
| query | string | min 2 chars | User's search input, wrapped in `%` for partial matching |

### Response

Array of `Conversation` objects (existing type). Returns up to 10 results ordered by newest first.

### Error Handling

| Scenario | Behavior |
|----------|----------|
| Success, results found | Display conversation results (title + creator name) |
| Success, empty array | Display "No conversations found" |
| Supabase error | Display "Search is temporarily unavailable" |
| Request aborted (new input) | Silently ignore |

## Internal Component Contracts

### LocationSearch Component (modified)

```typescript
interface LocationSearchProps {
  onSelectLocation: (
    lat: number,
    lng: number,
    boundingbox: [number, number, number, number]
  ) => void;
  onSelectConversation: (conversation: Conversation) => void;
}
```

Now accepts two callbacks: one for place results (existing), one for chat results (new). The component manages the search mode toggle internally.

### useConversationSearch Hook (new)

```typescript
function useConversationSearch(): {
  query: string;
  setQuery: (q: string) => void;
  results: Conversation[];
  loading: boolean;
  error: string | null;
};
```

Same interface as `useNominatimSearch`. Queries Supabase conversations table with ILIKE filter, 300ms debounce, AbortController cancellation, 10-result limit.
