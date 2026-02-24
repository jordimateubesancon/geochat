-- 002_create_conversations.sql
-- Conversations table: each conversation is anchored to a geographic point.

CREATE TABLE conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL CHECK (char_length(title) <= 120),
  location      GEOGRAPHY(Point, 4326) NOT NULL,
  latitude      DOUBLE PRECISION NOT NULL,
  longitude     DOUBLE PRECISION NOT NULL,
  creator_name  TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spatial index for viewport and radius queries
CREATE INDEX conversations_location_idx
  ON conversations USING GIST (location);

-- B-tree index for ordering by creation time
CREATE INDEX conversations_created_at_idx
  ON conversations (created_at DESC);
