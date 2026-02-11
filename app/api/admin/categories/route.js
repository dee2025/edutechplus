import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
  const token = req.cookies.get("admin_auth_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  jwt.verify(token, process.env.JWT_SECRET);

  const [rows] = await pool.execute(
    "SELECT * FROM categories ORDER BY parent_id ASC, name ASC",
  );

  // Build hierarchical structure
  const categoriesMap = new Map();
  const rootCategories = [];

  rows.forEach((cat) => {
    cat.subcategories = [];
    categoriesMap.set(cat.id, cat);
  });

  rows.forEach((cat) => {
    if (cat.parent_id) {
      const parent = categoriesMap.get(cat.parent_id);
      if (parent) {
        parent.subcategories.push(cat);
      }
    } else {
      rootCategories.push(cat);
    }
  });

  return NextResponse.json(rootCategories);
}

export async function POST(req) {
  const token = req.cookies.get("admin_auth_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.role !== "super_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { name, slug, description, parent_id } = await req.json();

  if (!name || !slug) {
    return NextResponse.json(
      { message: "Name and slug required" },
      { status: 400 },
    );
  }

  await pool.execute(
    "INSERT INTO categories (parent_id, name, slug, description) VALUES (?, ?, ?, ?)",
    [parent_id || null, name, slug, description || null],
  );

  return NextResponse.json({ message: "Category created" });
}
