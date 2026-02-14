// Run OAuth fields migration
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
    console.log("Running OAuth fields migration...");

    // Add provider column
    try {
      await connection.execute(
        "ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'credentials' COMMENT 'OAuth provider (google, credentials, etc)'"
      );
      console.log("✓ Added provider column");
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("✓ provider column already exists");
      } else {
        throw err;
      }
    }

    // Add provider_id column
    try {
      await connection.execute(
        "ALTER TABLE users ADD COLUMN provider_id VARCHAR(255) DEFAULT NULL COMMENT 'Provider-specific user ID (e.g., Google sub)'"
      );
      console.log("✓ Added provider_id column");
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("✓ provider_id column already exists");
      } else {
        throw err;
      }
    }

    // Add email_verified column
    try {
      await connection.execute(
        "ALTER TABLE users ADD COLUMN email_verified TIMESTAMP NULL COMMENT 'When email was verified'"
      );
      console.log("✓ Added email_verified column");
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("✓ email_verified column already exists");
      } else {
        throw err;
      }
    }

    // Create index on provider_id
    try {
      await connection.execute(
        "CREATE INDEX idx_provider_id ON users(provider, provider_id)"
      );
      console.log("✓ Created index on provider_id");
    } catch (err) {
      if (err.code === "ER_DUP_KEY_NAME") {
        console.log("✓ Index already exists");
      } else {
        throw err;
      }
    }

    console.log("\n✓ OAuth migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
