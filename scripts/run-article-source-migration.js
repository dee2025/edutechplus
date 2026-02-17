#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

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

console.log("📝 Article Source Migration");
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
      "../db/migrations/2026-02-17-add-article-source.sql",
    );
    const migrationSQL = fs.readFileSync(migrationFile, "utf8");

    console.log("🔗 Connecting to database...");

    // Use mysql2 for database connection
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection(dbConfig);

    console.log("✅ Connected to database");
    console.log("");

    // Split migration into individual statements
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    console.log("");

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview =
        statement.substring(0, 60).replace(/\s+/g, " ") +
        (statement.length > 60 ? "..." : "");

      console.log(`[${i + 1}/${statements.length}] ${preview}`);

      try {
        await connection.execute(statement);
        console.log("  ✅ Success");
      } catch (err) {
        // Check if it's a "duplicate column" error (which is okay due to IF NOT EXISTS)
        if (err.code === "ER_DUP_FIELDNAME" || err.code === "ER_DUP_KEYNAME") {
          console.log("  ⚠️  Already exists (skipped)");
        } else {
          console.error("  ❌ Error:", err.message);
          throw err;
        }
      }
    }

    console.log("");
    console.log("✅ Migration completed successfully!");
    console.log("");
    console.log("Next steps:");
    console.log(
      "1. Articles created by users will have created_by_role = 'user'",
    );
    console.log(
      "2. Articles created by admins will have created_by_role = 'admin'",
    );
    console.log("3. Public website will only show user articles");
    console.log("4. Admin panel will show all articles");

    await connection.end();
  } catch (error) {
    console.error("");
    console.error("❌ Migration failed:");
    console.error(error);
    process.exit(1);
  }
}

runMigration();
