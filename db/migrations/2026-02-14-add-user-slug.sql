-- Add user_slug column to users table for SEO-friendly URLs
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_slug VARCHAR(255) UNIQUE;

-- Add index on user_slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_user_slug ON users(user_slug);

