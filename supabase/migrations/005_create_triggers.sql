-- 005_create_triggers.sql
-- Triggers for denormalized data maintenance and geography column population.

-- Trigger function: populate location geography from latitude/longitude on INSERT.
CREATE OR REPLACE FUNCTION set_conversation_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$;

CREATE TRIGGER conversations_set_location
  BEFORE INSERT ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION set_conversation_location();

-- Trigger function: update message_count and last_message_at on the parent
-- conversation when a new message is inserted.
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE conversations
  SET message_count = message_count + 1,
      last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER messages_update_conversation_stats
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_stats();
