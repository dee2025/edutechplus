-- Migration: add optional fields for a more feature-rich article editor
-- Run this on your MySQL database (adjust types if needed)

ALTER TABLE articles
  ADD COLUMN subtitle VARCHAR(255) NULL,
  ADD COLUMN canonical_url VARCHAR(512) NULL,
  ADD COLUMN tags TEXT NULL,
  ADD COLUMN content_format VARCHAR(32) DEFAULT 'html' NULL;

-- Optional: If you prefer to store tags as JSON and your MySQL version supports it, run:
-- ALTER TABLE articles MODIFY tags JSON NULL;

-- Note: This repo does not include an automated migration runner. Run this SQL using your preferred DB admin tool or the mysql CLI.
