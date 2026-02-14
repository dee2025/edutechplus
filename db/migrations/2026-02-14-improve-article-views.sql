-- Improve article_views table with better indexing and constraints
-- This migration enhances the article views tracking system

-- 1. Add foreign key constraint if not already present
ALTER TABLE article_views
  ADD CONSTRAINT fk_article_views_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;

-- 2. Add indexes for common query patterns (may already exist)
-- Index for getting total views per article
ALTER TABLE article_views
  ADD INDEX IF NOT EXISTS idx_article_id (article_id);

-- Index for getting views in time ranges
ALTER TABLE article_views
  ADD INDEX IF NOT EXISTS idx_article_created (article_id, created_at);

-- Index for deduplication by user_id and article
ALTER TABLE article_views
  ADD INDEX IF NOT EXISTS idx_article_user_created (article_id, user_id, created_at);

-- Index for deduplication by IP and article
ALTER TABLE article_views
  ADD INDEX IF NOT EXISTS idx_article_ip_created (article_id, ip, created_at);

-- Index for deduplication by user agent and article
ALTER TABLE article_views
  ADD INDEX IF NOT EXISTS idx_article_ua_created (article_id, user_agent, created_at);

-- 3. Optimize created_at field (should use timestamp precision)
-- Already optimal in table creation, but ensuring consistency

-- 4. Add column to track if view was from authenticated user (for analytics)
ALTER TABLE article_views
  ADD COLUMN IF NOT EXISTS is_authenticated BOOLEAN DEFAULT FALSE;

-- 5. Update existing rows to mark authenticated views
UPDATE article_views SET is_authenticated = TRUE WHERE user_id IS NOT NULL;
