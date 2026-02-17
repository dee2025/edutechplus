-- Tags and Article Tags tables for tag-based content discovery
-- Enable users to tag articles with multiple topics for better categorization

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  color VARCHAR(7) DEFAULT '#06B6D4' COMMENT 'Hex color for tag display',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create article_tags junction table
CREATE TABLE IF NOT EXISTS article_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_article_tag (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  INDEX idx_article_tags_article (article_id),
  INDEX idx_article_tags_tag (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert popular tags
INSERT INTO tags (name, slug, description, color) VALUES
('JavaScript', 'javascript', 'JavaScript language and related technologies', '#F7DF1E'),
('React', 'react', 'React library and related frameworks', '#61DAFB'),
('Web Development', 'web-development', 'General web development topics', '#06B6D4'),
('Tutorial', 'tutorial', 'Educational and tutorial content', '#10B981'),
('Career', 'career', 'Career advice and professional development', '#8B5CF6'),
('CSS', 'css', 'CSS styling and design', '#1572B6'),
('TypeScript', 'typescript', 'TypeScript and type safety', '#3178C6'),
('Node.js', 'nodejs', 'Node.js backend development', '#68A063'),
('Database', 'database', 'Database design and management', '#336791'),
('DevOps', 'devops', 'DevOps and deployment practices', '#1434CB')
ON DUPLICATE KEY UPDATE slug=VALUES(slug);
