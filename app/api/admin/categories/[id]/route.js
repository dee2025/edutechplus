import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const prarm = await params;
  const id = prarm.id;
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "super_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { name, slug, description, is_active, parent_id } = await req.json();

  await pool.execute(
    `UPDATE categories
         SET parent_id=?, name=?, slug=?, description=?, is_active=?
         WHERE id=?`,
    [parent_id || null, name, slug, description || null, is_active, id],
  );

  return NextResponse.json({ message: "Category updated" });
}

export async function DELETE(req, { params }) {
  const prarm = await params;
  const id = prarm.id;

  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "super_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await pool.execute("DELETE FROM categories WHERE id = ?", [id]);

  return NextResponse.json({ message: "Category deleted" });
}
