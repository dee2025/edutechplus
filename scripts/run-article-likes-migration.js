const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("Running migration: Create article_likes table...");

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, "../db/migrations/2026-02-17-add-article-likes.sql"),
      "utf8",
    );

    await connection.query(migrationSQL);

    console.log("✓ Migration completed successfully!");
    console.log("article_likes table created with indexes.");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
