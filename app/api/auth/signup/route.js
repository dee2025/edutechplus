import { signToken } from "@/lib/auth";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password required" },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    try {
      const [result] = await pool.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashed],
      );

      const token = await signToken({
        id: result.insertId,
        role: "user",
        email,
      });

      const response = NextResponse.json({
        message: "User created",
        user_id: result.insertId,
      });

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    } catch (err) {
      console.error(err);
      if (err?.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { message: "Email already registered" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        {
          message:
            "Failed to create user. Ensure DB has `users` table via migration.",
        },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
