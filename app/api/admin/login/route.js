import { signToken } from "@/lib/auth";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 },
      );
    }

    const [rows] = await pool.execute(
      "SELECT * FROM admins WHERE email = ? AND is_active = 1",
      [email],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const admin = rows[0];
    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = await signToken({
      id: admin.id,
      role: admin.role,
      email: admin.email,
      author_id: admin.author_id,
    });

    const response = NextResponse.json({
      message: "Login successful",
      admin: {
        id: admin.id,
        name: admin.name,
        role: admin.role,
      },
    });

    // Use a separate cookie name for admin sessions to prevent regular user sessions from accessing admin routes
    response.cookies.set("admin_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
