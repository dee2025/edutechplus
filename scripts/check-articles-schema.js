const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

async function checkArticlesTable() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [schema] = await conn.execute(`DESCRIBE articles`);
    console.log("Articles table schema:");
    schema.forEach((col) => {
      console.log(
        `  ${col.Field}: ${col.Type} (${col.Null === "YES" ? "nullable" : "not null"})`,
      );
    });
  } catch (e) {
    console.error("Error:", e.message);
  }

  await conn.end();
}

checkArticlesTable();
