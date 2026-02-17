-- Add article source column to distinguish between admin and user articles
-- This helps filter which articles to show on the public website

-- Add created_by_role column to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS created_by_role ENUM('user', 'admin') DEFAULT 'user' 
COMMENT 'Indicates whether article was created by a user or admin';

-- Add index for filtering queries
CREATE INDEX IF NOT EXISTS idx_articles_created_by_role ON articles(created_by_role, status);

-- Update existing articles to set the correct role based on author_id
-- Assuming admin IDs don't exist in users table or are properly distinguished
-- This will mark articles without matching users as admin articles
UPDATE articles a
LEFT JOIN users u ON u.id = a.author_id
SET a.created_by_role = CASE 
    WHEN u.id IS NULL THEN 'admin'
    ELSE 'user'
END
WHERE a.created_by_role IS NULL OR a.created_by_role = 'user';
