-- Add subcategories support to categories table
ALTER TABLE categories ADD COLUMN parent_id INT(11) NULL AFTER id;
ALTER TABLE categories ADD CONSTRAINT fk_parent_category FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE;
