const mysql = require("mysql2/promise");
const fs = require("fs");
require("dotenv").config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "articlegrip",
  });

  try {
    const sql = fs.readFileSync(
      "./db/migrations/2026-02-16-add-username.sql",
      "utf8",
    );
    const queries = sql.split(";").filter((q) => q.trim());

    for (const query of queries) {
      if (query.trim()) {
        console.log("Running:", query.substring(0, 50) + "...");
        await connection.execute(query);
      }
    }

    console.log("✓ Migration completed successfully");
  } catch (err) {
    console.error("✗ Migration failed:", err.message);
  } finally {
    await connection.end();
  }
}

runMigration();
