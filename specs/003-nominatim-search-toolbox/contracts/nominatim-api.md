# Contract: Nominatim Search API Integration

**Feature Branch**: `003-nominatim-search-toolbox`
**Date**: 2026-02-25

## External API: Nominatim Search

This feature consumes an external API. No new APIs are exposed by GeoChat.

### Endpoint

```
GET https://nominatim.openstreetmap.org/search
```

### Request Parameters

| Parameter | Value | Required | Description |
|-----------|-------|----------|-------------|
| q | string | Yes | Free-form search query (e.g., "Barcelona") |
| format | `jsonv2` | Yes | Response format |
| limit | `5` | Yes | Max number of results (1-40) |

### Request Headers

| Header | Value | Required | Description |
|--------|-------|----------|-------------|
| User-Agent | `GeoChat/1.0` | Yes | Identifies the application per Nominatim usage policy |

### Response (200 OK)

Array of result objects. Relevant fields:

```typescript
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string]; // [min_lat, max_lat, min_lon, max_lon]
}
```

### Response (Empty)

Empty array `[]` when no results match the query.

### Error Handling

| Scenario | Behavior |
|----------|----------|
| HTTP 200, empty array | Display "No results found" |
| HTTP 4xx/5xx | Display "Search is temporarily unavailable" |
| Network error / timeout | Display "Search is temporarily unavailable" |
| Request aborted (new input) | Silently ignore (not an error) |

### Rate Limiting Compliance

- Minimum 300ms debounce between requests (client-side)
- AbortController cancels in-flight requests (only 1 active request at a time)
- User-Agent header always included

## Internal Component Contracts

### Toolbox Component

```typescript
interface ToolboxProps {
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
```

Renders a collapsible left-side panel. Agnostic to its contents — any tool can be placed as children.

### LocationSearch Component

```typescript
interface LocationSearchProps {
  onSelect: (lat: number, lng: number, boundingbox: [number, number, number, number]) => void;
}
```

Self-contained search component. Manages its own query/results state internally via `useNominatimSearch`. Calls `onSelect` when the user picks a result.

### useNominatimSearch Hook

```typescript
function useNominatimSearch(): {
  query: string;
  setQuery: (q: string) => void;
  results: NominatimResult[];
  loading: boolean;
  error: string | null;
};
```

Encapsulates all Nominatim API interaction. Debounces input, manages AbortController, returns results or error state.
