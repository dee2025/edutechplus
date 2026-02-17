require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function listUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "82.180.144.17",
    user: process.env.DB_USER || "evadmin",
    password: process.env.DB_PASSWORD || "X&p6k8o81",
    database: process.env.DB_NAME || "dbevinfo",
  });

  try {
    const [users] = await connection.execute(
      "SELECT id, name, username, user_slug FROM users ORDER BY name"
    );

    console.log("\n📋 All Users and Their Usernames:\n");
    console.log("ID | Name | Username | User Slug");
    console.log("-".repeat(80));

    users.forEach((u) => {
      console.log(
        `${u.id} | ${u.name.padEnd(20)} | ${(u.username || "NULL").padEnd(25)} | ${u.user_slug}`
      );
    });

    console.log("\nTotal users:", users.length);

    // Also search for gautam
    console.log("\n\n🔍 Searching for Gautam:\n");
    const [gautam] = await connection.execute(
      "SELECT * FROM users WHERE name LIKE '%gautam%' OR username LIKE '%gautam%'"
    );

    if (gautam.length > 0) {
      gautam.forEach((u) => {
        console.log(
          `Found: ID=${u.id}, Name=${u.name}, Username=${u.username}, Slug=${u.user_slug}`
        );
      });
    } else {
      console.log("No user found with 'gautam' in name or username");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await connection.end();
  }
}

listUsers();
