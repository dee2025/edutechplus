import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

export async function GET(req) {
  const token = getToken(req);
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // only admin/editor roles can access
    if (
      !decoded ||
      (!["super_admin", "editor"].includes(decoded.role) &&
        decoded.role !== "super_admin")
    ) {
      // allow editors and super_admin; editors may be limited further in real app
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const [rows] = await pool.query(
      `SELECT c.*, u.name AS user_name, a.title AS article_title, a.slug AS article_slug
       FROM comments c
       JOIN users u ON u.id = c.user_id
       JOIN articles a ON a.id = c.article_id
       ORDER BY c.created_at DESC`,
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
