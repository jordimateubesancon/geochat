# Data Model: Nominatim Search & Map Toolbox

**Feature Branch**: `003-nominatim-search-toolbox`
**Date**: 2026-02-25

## Overview

This feature introduces no persistent data. All entities are ephemeral (client-side, session-only). No database changes required.

## Entities

### NominatimResult

Represents a single location result returned by the Nominatim search API.

| Field | Type | Description |
|-------|------|-------------|
| place_id | number | Unique Nominatim identifier for the place |
| display_name | string | Human-readable formatted address (e.g., "Barcelona, Catalonia, Spain") |
| lat | string | Latitude as string (Nominatim returns strings) |
| lon | string | Longitude as string (Nominatim returns strings) |
| boundingbox | [string, string, string, string] | Bounding box as [min_lat, max_lat, min_lon, max_lon] (strings) |

**Source**: Nominatim `/search` endpoint with `format=jsonv2`
**Lifecycle**: Created on API response, discarded when search input changes or component unmounts.

### SearchState

Internal state of the search tool.

| Field | Type | Description |
|-------|------|-------------|
| query | string | Current text in the search input |
| results | NominatimResult[] | List of suggestions from the latest search |
| loading | boolean | Whether a search request is in flight |
| error | string or null | Error message if the search failed |

**Lifecycle**: Managed by the `useNominatimSearch` hook. Resets when the toolbox closes.

## Relationships

```
Toolbox (container)
  └── LocationSearch (tool)
        └── uses NominatimResult[] (ephemeral)
              └── triggers map.flyToBounds() on selection
```

## State Transitions

```
Search Input Flow:
  idle → typing (user enters text)
  typing → debouncing (300ms timer starts)
  debouncing → fetching (timer fires, API called)
  fetching → results (API returns data)
  fetching → error (API fails or timeout)
  fetching → idle (request cancelled — new input arrived)
  results → typing (user modifies input)
  results → idle (user selects a result or clears input)
```

## No Database Changes

This feature is entirely client-side. No Supabase tables, RPC functions, or realtime subscriptions are needed.
