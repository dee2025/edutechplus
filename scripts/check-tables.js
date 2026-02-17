const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

async function checkTables() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log("Checking tables in database:", process.env.DB_NAME);

  const [tables] = await conn.execute("SHOW TABLES LIKE '%tags%'");
  console.log('\nTables matching "%tags%":');
  console.log(tables);

  await conn.end();
}

checkTables().catch(console.error);
