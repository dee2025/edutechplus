import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

export async function PUT(req, { params }) {
  const param = await params;
  const id = param.id;
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "super_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const {
    is_featured,
    is_trending,
    is_editors_pick,
    featured_order,
    trending_order,
  } = await req.json();

  await pool.execute(
    `
        UPDATE article_flags
        SET
            is_featured = ?,
            is_trending = ?,
            is_editors_pick = ?,
            featured_order = ?,
            trending_order = ?
        WHERE article_id = ?
        `,
    [
      is_featured ? 1 : 0,
      is_trending ? 1 : 0,
      is_editors_pick ? 1 : 0,
      featured_order ?? null,
      trending_order ?? null,
      id,
    ],
  );

  return NextResponse.json({ message: "Flags updated" });
}
