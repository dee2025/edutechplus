-- Add username column to users table for profile URLs
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;

-- Add index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
