-- Create article_likes table for like/unlike functionality
CREATE TABLE IF NOT EXISTS article_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (article_id, user_id),
  INDEX idx_article_likes_article (article_id),
  INDEX idx_article_likes_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
