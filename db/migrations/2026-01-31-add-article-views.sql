-- Create `article_views` table to track per-article views
-- Includes optional `user_id` to dedupe logged-in users and IP/UA for anonymous dedupe

CREATE TABLE IF NOT EXISTS article_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_id INT DEFAULT NULL,
  ip VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(512) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article_created (article_id, created_at),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_ip_created (ip, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: add FK to `articles` when the table is confirmed compatible
-- ALTER TABLE article_views
--   ADD CONSTRAINT fk_article_views_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;