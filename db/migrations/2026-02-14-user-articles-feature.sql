-- Add user preferences and interests tables
-- Track user's category interests and reading history for personalized recommendations

-- User interests - categories user is interested in
CREATE TABLE IF NOT EXISTS user_interests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  interest_score FLOAT DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_category (user_id, category_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_user_interests (user_id, interest_score DESC)
);

-- User reading preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  preferred_categories TEXT NULL COMMENT 'JSON array of preferred category IDs',
  auto_generate_interests BOOLEAN DEFAULT 1 COMMENT 'Auto-generate from reading history',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Track which users have published articles
-- Helps identify author pages and user contributions
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id INT DEFAULT NULL COMMENT 'User who created/published article';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published' COMMENT 'published, draft, unpublished';

-- Add indexes for author queries
CREATE INDEX IF NOT EXISTS idx_articles_author_status ON articles(author_id, status);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
