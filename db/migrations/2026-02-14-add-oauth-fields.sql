-- Add OAuth provider fields to users table
-- Allows tracking which provider (Google, Credentials, etc.) user registered with
-- and storing provider-specific IDs

ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'credentials' COMMENT 'OAuth provider (google, credentials, etc)';
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255) DEFAULT NULL COMMENT 'Provider-specific user ID (e.g., Google sub)';
ALTER TABLE users ADD COLUMN email_verified TIMESTAMP NULL COMMENT 'When email was verified';

-- Create index on provider_id for faster lookups
CREATE INDEX idx_provider_id ON users(provider, provider_id);
