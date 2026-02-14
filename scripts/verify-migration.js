import pool from "../lib/db.js";

try {
  const [[check]] = await pool.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_NAME='article_views' AND COLUMN_NAME='is_authenticated'`,
  );

  if (check) {
    console.log("✅ Migration verified: is_authenticated column exists!");
  } else {
    console.log("⚠️  Column not found");
  }

  await pool.end();
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}
