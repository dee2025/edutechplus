import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

/**
 * GET: Single admin
 */
export async function GET(req, { params }) {
  const prarm = await params;
  const id = prarm.id;
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
         WHERE id = ?`,
    [id],
  );

  if (!rows.length) {
    return NextResponse.json({ message: "Admin not found" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}

/**
 * PUT: Update admin
 */
export async function PUT(req, { params }) {
  const prarm = await params;
  const id = prarm.id;
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "super_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { name, email, password, role, is_active } = await req.json();

  let query = `
        UPDATE admins
        SET name=?, email=?, role=?, is_active=?
        WHERE id=?
    `;
  let values = [name, email, role, is_active, id];

  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    query = `
            UPDATE admins
            SET name=?, email=?, password=?, role=?, is_active=?
            WHERE id=?
        `;
    values = [name, email, hashed, role, is_active, id];
  }

  await pool.execute(query, values);

  return NextResponse.json({ message: "Admin updated" });
}

/**
 * DELETE: Delete admin
 */
export async function DELETE(req, { params }) {
  const prarm = await params;
  const id = prarm.id;
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "super_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Safety: prevent deleting admin who owns articles
  const [[row]] = await pool.execute(
    "SELECT COUNT(*) AS total FROM articles WHERE author_id = ?",
    [id],
  );

  if (row.total > 0) {
    return NextResponse.json(
      { message: "Cannot delete admin with articles" },
      { status: 400 },
    );
  }

  await pool.execute("DELETE FROM admins WHERE id = ?", [id]);

  return NextResponse.json({ message: "Admin deleted" });
}
