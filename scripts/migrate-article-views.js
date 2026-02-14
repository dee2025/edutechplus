#!/usr/bin/env node

import dotenv from "dotenv";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

async function runMigration() {
  let connection;
  try {
    console.log("🔄 Running article_views improvement migration...\n");

    // Connect to database
    console.log("📡 Connecting to database...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log("✅ Connected!\n");

    // 1. Add is_authenticated column
    try {
      console.log("1️⃣  Adding is_authenticated column...");
      await connection.execute(
        `ALTER TABLE article_views ADD COLUMN is_authenticated BOOLEAN DEFAULT FALSE`,
      );
      console.log("   ✅ Column added\n");
    } catch (e) {
      if (
        e.message.includes("already exists") ||
        e.message.includes("Duplicate")
      ) {
        console.log("   ℹ️  Column already exists\n");
      } else {
        throw e;
      }
    }

    // 2. Update existing rows
    try {
      console.log("2️⃣  Updating existing rows...");
      const [result] = await connection.execute(
        `UPDATE article_views SET is_authenticated = TRUE WHERE user_id IS NOT NULL`,
      );
      console.log(`   ✅ Updated ${result.affectedRows} rows\n`);
    } catch (e) {
      console.log(`   ℹ️  ${e.message}\n`);
    }

    // 3. Add foreign key constraint (optional - may fail due to data integrity)
    try {
      console.log("3️⃣  Adding foreign key constraint...");
      await connection.execute(
        `ALTER TABLE article_views
         ADD CONSTRAINT fk_article_views_article 
         FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE`,
      );
      console.log("   ✅ Foreign key added\n");
    } catch (e) {
      if (
        e.message.includes("already exists") ||
        e.message.includes("Duplicate")
      ) {
        console.log("   ℹ️  Foreign key already exists\n");
      } else {
        // FK may fail due to data integrity issues - this is non-critical
        console.log(`   ℹ️  Skipping FK (optional): ${e.message}\n`);
      }
    }

    // 4. Add indexes
    const indexes = [
      {
        name: "idx_article_id",
        sql: `ALTER TABLE article_views ADD INDEX idx_article_id (article_id)`,
      },
      {
        name: "idx_article_created",
        sql: `ALTER TABLE article_views ADD INDEX idx_article_created (article_id, created_at)`,
      },
      {
        name: "idx_article_user_created",
        sql: `ALTER TABLE article_views ADD INDEX idx_article_user_created (article_id, user_id, created_at)`,
      },
      {
        name: "idx_article_ip_created",
        sql: `ALTER TABLE article_views ADD INDEX idx_article_ip_created (article_id, ip, created_at)`,
      },
      {
        name: "idx_article_ua_created",
        sql: `ALTER TABLE article_views ADD INDEX idx_article_ua_created (article_id, user_agent, created_at)`,
      },
    ];

    console.log("4️⃣  Adding indexes...");
    for (const idx of indexes) {
      try {
        await connection.execute(idx.sql);
        console.log(`   ✅ ${idx.name}`);
      } catch (e) {
        if (
          e.message.includes("already exists") ||
          e.message.includes("Duplicate")
        ) {
          console.log(`   ℹ️  ${idx.name} (already exists)`);
        } else {
          console.log(`   ⚠️  ${idx.name}`);
        }
      }
    }

    console.log("\n✅ Migration completed!\n");

    // Verify
    const [rows] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME='article_views' AND COLUMN_NAME='is_authenticated'`,
      [process.env.DB_NAME],
    );

    if (rows.length > 0) {
      console.log("✅ VERIFIED: is_authenticated column exists!\n");
      console.log("🎉 You can now use the analytics pages!");
    } else {
      console.log("⚠️  WARNING: is_authenticated column not found\n");
    }
  } catch (err) {
    console.error("\n❌ Migration error:", err.message);
    if (err.sql) console.error("SQL:", err.sql);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
