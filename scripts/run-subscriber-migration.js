// Run database migrations
import { config } from "dotenv";
import { readFileSync } from "fs";
import mysql from "mysql2/promise";
import { resolve } from "path";

// Load environment variables
config({ path: resolve("./.env.local") });

async function runMigration() {
  if (!process.env.DB_HOST) {
    console.error("Error: Database environment variables not found");
    console.log(
      "Please ensure .env.local exists with DB_HOST, DB_USER, DB_PASSWORD, DB_NAME",
    );
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    console.log("Running migration: 2026-02-14-create-subscribers.sql");

    const sql = readFileSync(
      resolve("./db/migrations/2026-02-14-create-subscribers.sql"),
      "utf8",
    );

    await connection.query(sql);

    console.log("✓ Migration completed successfully!");
    console.log("✓ Subscribers table created");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
