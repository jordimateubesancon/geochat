-- 007_add_channels.sql
-- Topic Channels: new channels table, FK on conversations, updated RPC functions.

-- ============================================================================
-- 1. Create channels table
-- ============================================================================
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) <= 60) UNIQUE,
  slug TEXT NOT NULL CHECK (char_length(slug) <= 60) UNIQUE,
  description TEXT NOT NULL CHECK (char_length(description) <= 280),
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX channels_slug_idx ON channels (slug);
CREATE INDEX channels_sort_order_idx ON channels (sort_order, name);

-- ============================================================================
-- 2. Seed initial channels
-- ============================================================================
INSERT INTO channels (name, slug, description, icon, sort_order) VALUES
  ('General',         'general',         'General outdoor discussions and meetups',             '🌍', 0),
  ('Skimo',           'skimo',           'Ski mountaineering routes, conditions, and partners', '⛷️', 1),
  ('Rock Climbing',   'rock-climbing',   'Climbing spots, beta, and belay partners',            '🧗', 2),
  ('Trail Running',   'trail-running',   'Trail routes, races, and running groups',             '🏃', 3),
  ('Hiking',          'hiking',          'Hiking trails, conditions, and group hikes',          '🥾', 4),
  ('Mountain Biking', 'mountain-biking', 'MTB trails, bike parks, and riding groups',           '🚵', 5);

-- ============================================================================
-- 3. Add channel_id to conversations
-- ============================================================================
-- Add as nullable first
ALTER TABLE conversations ADD COLUMN channel_id UUID;

-- Assign all existing conversations to "General"
UPDATE conversations
SET channel_id = (SELECT id FROM channels WHERE slug = 'general')
WHERE channel_id IS NULL;

-- Make NOT NULL
ALTER TABLE conversations ALTER COLUMN channel_id SET NOT NULL;

-- Add FK constraint
ALTER TABLE conversations
  ADD CONSTRAINT conversations_channel_id_fkey
  FOREIGN KEY (channel_id) REFERENCES channels (id) ON DELETE CASCADE;

-- Index for filtered queries
CREATE INDEX conversations_channel_id_idx ON conversations (channel_id);

-- ============================================================================
-- 4. RLS policies for channels
-- ============================================================================
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Anyone can read channels
CREATE POLICY "channels_select_all" ON channels
  FOR SELECT USING (true);

-- No insert/update/delete via anon key (admin-only via service key or dashboard)

-- ============================================================================
-- 5. Enable realtime for channels (optional, for future use)
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE channels;

-- ============================================================================
-- 6. Update RPC functions to accept channel_id filter
-- ============================================================================
CREATE OR REPLACE FUNCTION conversations_in_bounds(
  min_lng FLOAT,
  min_lat FLOAT,
  max_lng FLOAT,
  max_lat FLOAT,
  p_channel_id UUID DEFAULT NULL
)
RETURNS SETOF conversations
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM conversations
  WHERE location && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography
    AND (p_channel_id IS NULL OR channel_id = p_channel_id);
$$;

CREATE OR REPLACE FUNCTION conversations_nearby(
  lng FLOAT,
  lat FLOAT,
  radius_meters FLOAT DEFAULT 1000,
  p_channel_id UUID DEFAULT NULL
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
  )
  AND (p_channel_id IS NULL OR channel_id = p_channel_id);
$$;
