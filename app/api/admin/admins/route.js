import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("auth_token")?.value;
}

/**
 * GET: List all admins
 */
export async function GET(req) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "super_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const [rows] = await pool.execute(
    `SELECT id, name, email, role, is_active, created_at
         FROM admins
         ORDER BY created_at DESC`,
  );

  return NextResponse.json(rows);
}

/**
 * POST: Create admin/editor
 */
export async function POST(req) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "super_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const {
    name,
    email,
    password,
    role = "editor",
    is_active = 1,
  } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Name, email and password required" },
      { status: 400 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.execute(
    `INSERT INTO admins (name, email, password, role, is_active)
         VALUES (?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, role, is_active],
  );

  return NextResponse.json({ message: "Admin created" });
}
