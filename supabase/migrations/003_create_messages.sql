-- 003_create_messages.sql
-- Messages table: each message belongs to exactly one conversation.

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  author_name     TEXT NOT NULL,
  body            TEXT NOT NULL CHECK (char_length(body) <= 2000),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite index for paginated message loading (most recent first)
CREATE INDEX messages_conversation_id_created_at_idx
  ON messages (conversation_id, created_at DESC);
