import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  jwt.verify(token, process.env.JWT_SECRET);

  const [rows] = await pool.execute(
    "SELECT * FROM categories ORDER BY created_at DESC",
  );

  return NextResponse.json(rows);
}

export async function POST(req) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.role !== "super_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { name, slug, description } = await req.json();

  if (!name || !slug) {
    return NextResponse.json(
      { message: "Name and slug required" },
      { status: 400 },
    );
  }

  await pool.execute(
    "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
    [name, slug, description || null],
  );

  return NextResponse.json({ message: "Category created" });
}
