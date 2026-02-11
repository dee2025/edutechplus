-- Create junction table for article-category many-to-many relationship
CREATE TABLE IF NOT EXISTS article_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_article_category (article_id, category_id),
    INDEX idx_article (article_id),
    INDEX idx_category (category_id),
    CONSTRAINT fk_article
        FOREIGN KEY (article_id) REFERENCES articles(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Migrate existing single category_id data to new junction table
INSERT INTO article_categories (article_id, category_id)
SELECT id, category_id FROM articles WHERE category_id IS NOT NULL;

-- Drop old category_id column from articles table (after migration)
-- ALTER TABLE articles DROP COLUMN category_id;
