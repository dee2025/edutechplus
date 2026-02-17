#!/usr/bin/env node

import dotenv from "dotenv";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

async function runAllMigrations() {
  let connection;

  try {
    // Get DB config from environment
    const dbConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
    };

    console.log(
      `\n📡 Connecting to ${dbConfig.user}@${dbConfig.host}/${dbConfig.database}...\n`,
    );

    connection = await mysql.createConnection(dbConfig);

    console.log("✅ Connected to database\n");

    // Read all migration files
    const migrationsDir = path.join(__dirname, "../db/migrations");
    const files = fs.readdirSync(migrationsDir).sort();

    console.log(`Found ${files.length} migration files:\n`);

    let successCount = 0;
    for (const file of files) {
      if (!file.endsWith(".sql")) continue;

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      try {
        console.log(`⏳ Running: ${file}`);

        // Split by semicolons and filter empty statements
        const statements = sql
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const statement of statements) {
          await connection.execute(statement);
        }

        console.log(`✅ ${file}\n`);
        successCount++;
      } catch (err) {
        // Ignore if already exists (idempotent migrations)
        if (
          err.message.includes("already exists") ||
          err.message.includes("Duplicate")
        ) {
          console.log(`ℹ️  ${file} (already applied)\n`);
          successCount++;
        } else {
          console.log(`⚠️  ${file}: ${err.message}\n`);
        }
      }
    }

    // Generate usernames for existing users without one
    console.log("\n⏳ Generating usernames for existing users...\n");

    try {
      const [users] = await connection.execute(
        'SELECT id, name FROM users WHERE username IS NULL OR username = ""',
      );

      if (users.length > 0) {
        console.log(`Found ${users.length} users without username\n`);

        for (const user of users) {
          const baseUsername = user.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .substring(0, 20);

          let username = baseUsername;
          let counter = 1;

          // Ensure uniqueness
          while (true) {
            const [existing] = await connection.execute(
              "SELECT id FROM users WHERE username = ?",
              [username],
            );

            if (existing.length === 0) break;
            username = `${baseUsername}-${counter}`;
            counter++;
          }

          await connection.execute(
            "UPDATE users SET username = ? WHERE id = ?",
            [username, user.id],
          );

          console.log(`  ✓ ${user.name} → ${username}`);
        }
      } else {
        console.log("✓ All users already have usernames\n");
      }
    } catch (err) {
      // username column might not exist yet, that's okay
      if (err.message.includes("Unknown column 'username'")) {
        console.log("ℹ️  Username column will be created by migrations\n");
      } else {
        console.log(`⚠️  ${err.message}\n`);
      }
    }

    console.log(
      `✅ All migrations completed! (${successCount}/${files.length} successfully)\n`,
    );
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runAllMigrations();
