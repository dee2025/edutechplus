-- Expand ai_chats.mode to support longer mode names like 'practice-test'
ALTER TABLE ai_chats
  MODIFY COLUMN mode VARCHAR(32) NOT NULL;
