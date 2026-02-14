-- User Follow System for ArticleGrip
-- Enable users to follow each other and build social connections

-- Create user_follows table for tracking who follows whom
CREATE TABLE IF NOT EXISTS user_follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  follower_id INT NOT NULL COMMENT 'User who is following',
  following_id INT NOT NULL COMMENT 'User being followed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_follow (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_follower (follower_id),
  INDEX idx_following (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add bio and profile picture fields to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT NULL COMMENT 'User biography';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) NULL COMMENT 'User profile picture URL';
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(255) NULL COMMENT 'User website/portfolio';
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(100) NULL COMMENT 'User location';
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter VARCHAR(100) NULL COMMENT 'Twitter handle';
ALTER TABLE users ADD COLUMN IF NOT EXISTS github VARCHAR(100) NULL COMMENT 'GitHub username';
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin VARCHAR(100) NULL COMMENT 'LinkedIn username';

-- Add indexes for user profile queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- Create user_stats table for caching follower counts
CREATE TABLE IF NOT EXISTS user_stats (
  user_id INT NOT NULL PRIMARY KEY,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  articles_count INT DEFAULT 0,
  total_views INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
