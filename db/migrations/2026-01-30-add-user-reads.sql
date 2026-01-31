-- Add `user_reads` table to track per-user article reads (one per day per article)

-- Use a conservative definition to avoid FOREIGN KEY errors when `articles` table
-- may not exist or may have mismatched engine/attributes. You can add the
-- article FK later with an ALTER statement once your `articles` table is
-- confirmed to be InnoDB and have a compatible `id` column.

CREATE TABLE IF NOT EXISTS user_reads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  article_id INT DEFAULT NULL,
  slug VARCHAR(255) NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  read_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_user_slug_date (user_id, slug, read_date),
  INDEX idx_user_date (user_id, read_date),
  INDEX idx_article_id (article_id),
  CONSTRAINT fk_user_reads_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: add article FK when `articles` table exists and is compatible
-- ALTER TABLE user_reads
--   ADD CONSTRAINT fk_user_reads_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL;
