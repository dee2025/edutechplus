import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("🔄 Starting username generation for existing users...");

    // Get all users without username
    const users = await query({
      query:
        "SELECT id, name FROM users WHERE username IS NULL OR username = ''",
      values: [],
    });

    if (users.length === 0) {
      return NextResponse.json({
        message: "✓ All users already have usernames",
        updated: 0,
      });
    }

    console.log(`Found ${users.length} users without username`);
    let updated = 0;

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
      updated++;
    }

    return NextResponse.json({
      message: "✓ Username generation completed",
      updated,
    });
  } catch (err) {
    console.error("Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
