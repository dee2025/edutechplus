-- Make password field nullable for OAuth users (Google, etc.)
-- OAuth users don't have passwords, so this field should be optional

ALTER TABLE users MODIFY password VARCHAR(255) NULL;
