// Run user articles feature migration
const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("Running user articles feature migration...\n");

    // Create user_interests table
    try {
      await connection.execute(`
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
        )
      `);
      console.log("✓ Created user_interests table");
    } catch (err) {
      if (err.code === "ER_TABLE_EXISTS_ERROR") {
        console.log("✓ user_interests table already exists");
      } else {
        throw err;
      }
    }

    // Create user_preferences table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL UNIQUE,
          preferred_categories TEXT NULL,
          auto_generate_interests BOOLEAN DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log("✓ Created user_preferences table");
    } catch (err) {
      if (err.code === "ER_TABLE_EXISTS_ERROR") {
        console.log("✓ user_preferences table already exists");
      } else {
        throw err;
      }
    }

    // Add author_id column to articles
    try {
      await connection.execute(
        "ALTER TABLE articles ADD COLUMN author_id INT DEFAULT NULL COMMENT 'User who created/published article'"
      );
      console.log("✓ Added author_id column to articles");
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("✓ author_id column already exists");
      } else {
        throw err;
      }
    }

    // Add status column to articles
    try {
      await connection.execute(
        "ALTER TABLE articles ADD COLUMN status VARCHAR(20) DEFAULT 'published' COMMENT 'published, draft, unpublished'"
      );
      console.log("✓ Added status column to articles");
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("✓ status column already exists");
      } else {
        throw err;
      }
    }

    // Create indexes
    try {
      await connection.execute(
        "CREATE INDEX idx_articles_author_status ON articles(author_id, status)"
      );
      console.log("✓ Created idx_articles_author_status");
    } catch (err) {
      if (err.code === "ER_DUP_KEY_NAME") {
        console.log("✓ Index idx_articles_author_status already exists");
      } else {
        throw err;
      }
    }

    try {
      await connection.execute(
        "CREATE INDEX idx_articles_status ON articles(status)"
      );
      console.log("✓ Created idx_articles_status");
    } catch (err) {
      if (err.code === "ER_DUP_KEY_NAME") {
        console.log("✓ Index idx_articles_status already exists");
      } else {
        throw err;
      }
    }

    console.log("\n✓ User articles feature migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
