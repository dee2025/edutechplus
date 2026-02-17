import { query } from "@/lib/db.js";

async function addUsernameToUsers() {
  try {
    console.log("Starting username generation...");

    // Get all users without username
    const users = await query({
      query: "SELECT id, name FROM users WHERE username IS NULL",
      values: [],
    });

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
        const existing = await query({
          query: "SELECT id FROM users WHERE username = ?",
          values: [username],
        });

        if (existing.length === 0) {
          break;
        }

        username = `${baseUsername}-${counter}`;
        counter++;
      }

      // Update user with username
      await query({
        query: "UPDATE users SET username = ? WHERE id = ?",
        values: [username, user.id],
      });

      console.log(`✓ ${user.name} -> ${username}`);
    }

    console.log("✓ Username generation completed");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

addUsernameToUsers();
