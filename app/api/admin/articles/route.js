import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

/**
 * GET: List articles (admin view only)
 */
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
        a.slug,
        a.featured_image,
        a.status,
        a.created_at,
        u.name AS author_name,
        JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'name', t.name, 'slug', t.slug, 'color', t.color)) AS tags
      FROM articles a
      LEFT JOIN users u ON u.id = a.author_id
      LEFT JOIN article_tags at ON at.article_id = a.id
      LEFT JOIN tags t ON t.id = at.tag_id
      WHERE a.created_by_role = 'user'
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

  // Parse tags JSON for each article
  const parsedRows = rows.map((row) => ({
    ...row,
    tags: row.tags
      ? JSON.parse(row.tags).filter((tag) => tag.name !== null)
      : [],
  }));

  return NextResponse.json(parsedRows);
}
