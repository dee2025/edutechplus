#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

// Load environment variables from .env.local
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

// Determine environment
const isProd = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "articlegrip",
};

console.log("🏷️  Tags Feature Migration");
console.log("==========================");
console.log(`Environment: ${isProd ? "PRODUCTION" : "DEVELOPMENT"}`);
console.log(
  `Database: ${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port}`,
);
console.log("");

async function runMigration() {
  try {
    console.log("📁 Reading migration file...");
    const migrationFile = path.join(
      __dirname,
      "../db/migrations/2026-02-14-add-tags-feature.sql",
    );
    const migrationSQL = fs.readFileSync(migrationFile, "utf8");

    console.log("🔗 Connecting to database...");

    // Use mysql command line for execution
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection(dbConfig);

    console.log("✅ Connected to database");
    console.log("");

    // Split migration into individual statements
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.length > 0) {
        console.log(`⏳ Executing: ${statement.substring(0, 50)}...`);
        await connection.execute(statement);
        console.log("✓ Success");
      }
    }

    console.log("");
    console.log("✅ Tags feature migration completed successfully!");
    console.log("");
    console.log("📋 Migration Summary:");
    console.log("  ✓ Created tags table");
    console.log("  ✓ Created article_tags junction table");
    console.log("  ✓ Inserted popular default tags");
    console.log("  ✓ Added necessary indexes");

    await connection.end();
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error.message);
    process.exit(1);
  }
}

runMigration();
