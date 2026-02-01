import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

export async function GET(req) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  jwt.verify(token, process.env.JWT_SECRET);

  const [rows] = await pool.execute(`
        SELECT
            a.id,
            a.title,
            a.status,
            af.is_featured,
            af.is_trending,
            af.is_editors_pick,
            af.featured_order,
            af.trending_order
        FROM articles a
        JOIN article_flags af ON af.article_id = a.id
        ORDER BY a.created_at DESC
    `);

  return NextResponse.json(rows);
}
