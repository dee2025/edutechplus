// Run database migration to make password field nullable
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
    console.log("Running migration: Make password nullable...");

    await connection.execute(
      "ALTER TABLE users MODIFY password VARCHAR(255) NULL",
    );

    console.log("✓ Migration completed successfully!");
    console.log("Password field is now nullable for OAuth users.");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
