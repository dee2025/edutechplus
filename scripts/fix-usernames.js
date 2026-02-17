const mysql = require("mysql2/promise");
require('dotenv').config({ path: '.env.local' });

async function generateUsernames() {
  console.log("🔄 Starting username generation...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "82.180.144.17",
    user: process.env.DB_USER || "evadmin",
    password: process.env.DB_PASSWORD || "X&p6k8o81",
    database: process.env.DB_NAME || "dbevinfo",
  });

  try {
    // Get all users without username
    const [users] = await connection.execute(
      "SELECT id, name FROM users WHERE username IS NULL OR username = ''"
    );

    if (users.length === 0) {
      console.log("✓ All users already have usernames");
      return;
    }

    console.log(`Found ${users.length} users without username`);

    for (const user of users) {
      // Generate username from name
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
          [username]
        );

        if (existing.length === 0) {
          break;
        }

        username = `${baseUsername}-${counter}`;
        counter++;
      }

      // Update user with username
      await connection.execute("UPDATE users SET username = ? WHERE id = ?", [
        username,
        user.id,
      ]);

      console.log(`✓ ${user.name} -> ${username}`);
    }

    console.log("✓ Username generation completed!");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await connection.end();
  }
}

generateUsernames();
