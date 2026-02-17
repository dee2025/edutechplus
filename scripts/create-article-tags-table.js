const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

async function createArticleTagsTable() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS article_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id BIGINT NOT NULL,
        tag_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_article_tag (article_id, tag_id),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        INDEX idx_article_tags_article (article_id),
        INDEX idx_article_tags_tag (tag_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ article_tags table created successfully");
  } catch (e) {
    console.error("Error creating table:", e.message);
  }

  await conn.end();
}

createArticleTagsTable();
