# Data Model: Chat Title Search with Dual Search Mode

**Feature Branch**: `004-chat-title-search`
**Date**: 2026-02-25

## Overview

This feature introduces no new persistent data or schema changes. It queries the existing `conversations` table by title. All search state is ephemeral (client-side only).

## Existing Entities Used

### Conversation (existing — no changes)

Already defined in `src/types/index.ts`. Used as the result type for chat title search.

| Field | Type | Relevance to this feature |
|-------|------|--------------------------|
| id | string | Unique identifier |
| title | string | **Searched field** — matched with case-insensitive partial matching |
| latitude | number | Used to fly the map to the conversation's location |
| longitude | number | Used to fly the map to the conversation's location |
| creator_name | string | Displayed in search results alongside the title |
| message_count | number | Not displayed in search results |
| last_message_at | string or null | Not displayed in search results |
| created_at | string | Used for ordering results (newest first) |

## New Client-Side State

### SearchMode

An enumeration controlling which search backend is active.

| Value | Description |
|-------|-------------|
| "places" | Nominatim geocoding search (existing behavior, default) |
| "chats" | Conversation title search (new) |

**Lifecycle**: Managed inside the search component. Resets to "places" when the toolbox closes.

### ConversationSearchState

Internal state of the chat title search (mirrors NominatimSearchState).

| Field | Type | Description |
|-------|------|-------------|
| query | string | Current text in the search input |
| results | Conversation[] | Matching conversations from the latest search |
| loading | boolean | Whether a search request is in flight |
| error | string or null | Error message if the search failed |

**Lifecycle**: Managed by the `useConversationSearch` hook. Cleared when mode switches or toolbox closes.

## No Database Changes

This feature queries the existing `conversations` table using Supabase client filters. No new tables, columns, indexes, or RPC functions are required.
