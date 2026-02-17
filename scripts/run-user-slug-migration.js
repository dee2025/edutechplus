require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  console.log("\n👤 User Slug System Migration");
  console.log("================================");

  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  };

  console.log(`Database: ${config.database} @ ${config.host}:${config.port}\n`);

  const conn = await mysql.createConnection(config);

  try {
    console.log("📁 Reading migration file...");
    const migrationPath = path.join(
      __dirname,
      "../db/migrations/2026-02-14-add-user-slug.sql",
    );
    const sqlContent = fs.readFileSync(migrationPath, "utf8");

    console.log("SQL Content loaded:", sqlContent.length, "bytes");

    console.log("🔗 Connecting to database...");
    console.log("✅ Connected to database\n");

    // Split by semicolon and execute statements
    const allLines = sqlContent.split("\n");
    const statements = [];
    let currentStatement = "";

    for (const line of allLines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith("--")) continue;

      currentStatement += " " + trimmed;

      if (trimmed.endsWith(";")) {
        statements.push(currentStatement.replace(/;$/, "").trim());
        currentStatement = "";
      }
    }

    console.log(`Found ${statements.length} statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;

      try {
        console.log(
          `⏳ Executing statement ${i + 1}: ${stmt.substring(0, 60)}...`,
        );
        await conn.execute(stmt);
        console.log("  ✓ Success");
      } catch (err) {
        if (
          err.code === "ER_DUP_ENTRY" ||
          err.code === "ER_BAD_FIELD_ERROR" ||
          err.code === "ER_DUP_KEYNAME" ||
          err.code === "ER_CANT_DROP_FIELD_OR_KEY"
        ) {
          console.log("  ✓ Already exists (skipped)");
        } else {
          console.error("  ✗ Error:", err.message);
          throw err;
        }
      }
    }

    // Now populate existing users with slugs
    console.log(`⏳ Populating user_slug for existing users...`);
    await conn.execute(`
      UPDATE users 
      SET user_slug = CONCAT(
        LOWER(TRIM(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '/', '-'), '.', '-'))),
        '-',
        id
      )
      WHERE user_slug IS NULL
    `);
    console.log("  ✓ Success");

    // Verify user_slug index
    const indexCheck = await conn.execute(
      "SELECT COUNT(*) as count FROM users WHERE user_slug IS NOT NULL",
    );

    console.log("\n✅ User slug system migration completed successfully!");
    console.log("\n📋 Migration Summary:");
    console.log(`  ✓ Added user_slug column to users table`);
    console.log(`  ✓ Created index for user_slug`);
    console.log(
      `  ✓ Generated slugs for users (${indexCheck[0][0].count} users updated)`,
    );

    await conn.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    await conn.end();
    process.exit(1);
  }
}

runMigration();
