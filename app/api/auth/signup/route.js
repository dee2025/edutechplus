import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Helper function to generate unique username from name
function generateUsername(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove special characters
    .substring(0, 20); // Limit to 20 characters
}

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUsers = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [email],
    });

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 400 },
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique username
    let baseUsername = generateUsername(name);
    let username = baseUsername;
    let counter = 1;

    // Ensure username is unique
    while (true) {
      const existingUsername = await query({
        query: "SELECT id FROM users WHERE username = ?",
        values: [username],
      });

      if (existingUsername.length === 0) {
        break; // Username is unique
      }

      username = `${baseUsername}-${counter}`;
      counter++;
    }

    // Create user
    await query({
      query:
        "INSERT INTO users (name, email, password, username, is_active) VALUES (?, ?, ?, ?, 1)",
      values: [name, email, hashedPassword, username],
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 },
    );
  }
}
