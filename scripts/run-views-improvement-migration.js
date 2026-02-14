#!/usr/bin/env node

/**
 * Run the improve-article-views migration
 */

import fs from "fs";
import path from "path";
import pool from "../lib/db.js";

async function runMigration() {
  try {
    console.log(
      "🔄 Running migration: 2026-02-14-improve-article-views.sql...\n",
    );

    // Read the migration file
    const migrationPath = path.join(
      process.cwd(),
      "db/migrations/2026-02-14-improve-article-views.sql",
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    // Split by semicolon and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement) {
        try {
          console.log(
            `✓ Executing: ${statement.split("\n")[0].substring(0, 60)}...`,
          );
          await pool.execute(statement);
        } catch (err) {
          // Some errors are OK (like adding FK that already exists)
          if (
            err.message.includes("already exists") ||
            err.message.includes("Duplicate")
          ) {
            console.log(`ℹ️  ${err.message}`);
          } else {
            throw err;
          }
        }
      }
    }

    console.log("\n✅ Migration completed successfully!");
    console.log(
      "📊 The is_authenticated column and indexes have been added.\n",
    );

    // Verify
    const [[result]] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'article_views' 
       AND COLUMN_NAME = 'is_authenticated'`,
    );

    if (result) {
      console.log("✅ Verified: is_authenticated column exists!");
    } else {
      console.log("⚠️  Could not verify column existence");
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

runMigration();
