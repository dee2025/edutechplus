#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "articlegrip",
};

console.log("👥 User Follow System Migration");
console.log("================================");
console.log(
  `Database: ${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port}`,
);
console.log("");

async function runMigration() {
  try {
    console.log("📁 Reading migration file...");
    const migrationFile = path.join(
      __dirname,
      "../db/migrations/2026-02-14-add-user-follows.sql",
    );
    const migrationSQL = fs.readFileSync(migrationFile, "utf8");

    console.log("🔗 Connecting to database...");

    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection(dbConfig);

    console.log("✅ Connected to database");
    console.log("");

    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.length > 0) {
        console.log(`⏳ Executing: ${statement.substring(0, 50)}...`);
        await connection.execute(statement);
        console.log("  ✓ Success");
      }
    }

    console.log("");
    console.log("✅ User follow system migration completed successfully!");
    console.log("");
    console.log("📋 Migration Summary:");
    console.log("  ✓ Created user_follows table");
    console.log("  ✓ Added user profile fields (bio, avatar, website, etc.)");
    console.log("  ✓ Created user_stats table for caching");
    console.log("  ✓ Added necessary indexes for performance");

    await connection.end();
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error.message);
    process.exit(1);
  }
}

runMigration();
