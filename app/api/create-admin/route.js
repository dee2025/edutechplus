import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 🔒 OPTIONAL: allow only in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { message: "Not allowed in production" },
        { status: 403 },
      );
    }

    const email = "admin@edutechplus.com";

    // 1️⃣ Check if admin already exists
    const [existing] = await pool.execute(
      "SELECT id FROM admins WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Admin already exists" },
        { status: 409 },
      );
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // 3️⃣ Insert admin
    await pool.execute(
      `INSERT INTO admins (name, email, password, role)
             VALUES (?, ?, ?, ?)`,
      ["Super Admin", email, hashedPassword, "super_admin"],
    );

    return NextResponse.json({
      message: "Admin created successfully",
      credentials: {
        email: "admin@edutechplus.com",
        password: "Admin@123",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
