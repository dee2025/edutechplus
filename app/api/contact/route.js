import pool from "@/lib/db"; // adjust path to your DB pool
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    let { name, email, message } = body;

    // -------------------------
    // 1. Basic validation
    // -------------------------
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    // -------------------------
    // 2. Normalize & sanitize
    // -------------------------
    name = name.trim();
    email = email.trim().toLowerCase();
    message = message.trim();

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { message: "Name must be between 2 and 100 characters" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 },
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { message: "Message must be at least 10 characters long" },
        { status: 400 },
      );
    }

    // -------------------------
    // 3. Metadata (anti-spam & audit)
    // -------------------------
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = req.headers.get("user-agent") || "unknown";

    // -------------------------
    // 4. Save to database
    // -------------------------
    await pool.execute(
      `
            INSERT INTO contact_messages
            (name, email, message, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?)
            `,
      [name, email, message, ipAddress, userAgent],
    );

    // -------------------------
    // 5. Success response
    // -------------------------
    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact API Error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
