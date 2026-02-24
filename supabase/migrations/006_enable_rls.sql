-- 006_enable_rls.sql
-- Enable Row Level Security on all tables.
-- V1 policies: allow all reads and inserts (anonymous access).

-- Conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on conversations"
  ON conversations FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access on conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access on messages"
  ON messages FOR INSERT
  WITH CHECK (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
