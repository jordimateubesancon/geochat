-- 004_create_rpc_functions.sql
-- Database functions exposed via Supabase RPC for spatial queries and pagination.

-- Returns conversations within the visible map viewport (bounding box).
CREATE OR REPLACE FUNCTION conversations_in_bounds(
  min_lng FLOAT,
  min_lat FLOAT,
  max_lng FLOAT,
  max_lat FLOAT
)
RETURNS SETOF conversations
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM conversations
  WHERE location && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography;
$$;

-- Returns conversations within a given radius (meters) of a point.
-- Used for the proximity warning when creating a new conversation (FR-005a).
CREATE OR REPLACE FUNCTION conversations_nearby(
  lng FLOAT,
  lat FLOAT,
  radius_meters FLOAT DEFAULT 1000
)
RETURNS SETOF conversations
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM conversations
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_meters
  );
$$;

-- Returns paginated messages for a conversation, most recent first.
-- Uses cursor-based pagination via before_timestamp parameter.
CREATE OR REPLACE FUNCTION messages_for_conversation(
  conv_id UUID,
  page_size INTEGER DEFAULT 50,
  before_timestamp TIMESTAMPTZ DEFAULT NULL
)
RETURNS SETOF messages
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM messages
  WHERE conversation_id = conv_id
    AND (before_timestamp IS NULL OR created_at < before_timestamp)
  ORDER BY created_at DESC
  LIMIT page_size;
$$;
