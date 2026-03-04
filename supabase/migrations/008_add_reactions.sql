-- Message reactions (thumbs up / thumbs down)
CREATE TABLE message_reactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_session_id TEXT NOT NULL,
  user_name       TEXT NOT NULL,
  reaction_type   TEXT NOT NULL CHECK (reaction_type IN ('thumbs_up', 'thumbs_down')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_session_id)
);

CREATE INDEX message_reactions_message_id_idx
  ON message_reactions (message_id);
CREATE INDEX message_reactions_conversation_id_idx
  ON message_reactions (conversation_id);

-- RLS
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reactions"
  ON message_reactions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert reactions"
  ON message_reactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own reactions"
  ON message_reactions FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own reactions"
  ON message_reactions FOR DELETE
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
