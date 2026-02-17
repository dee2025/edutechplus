import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

/**
 * GET: Single article (view only)
 */
export async function GET(req, { params }) {
  const param = await params;
  const id = param.id;

  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  jwt.verify(token, process.env.JWT_SECRET);

  const [article] = await pool.execute(
    `SELECT a.*, JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'name', c.name)) AS categories
     FROM articles a
     LEFT JOIN article_categories ac ON ac.article_id = a.id
     LEFT JOIN categories c ON c.id = ac.category_id
     WHERE a.id = ?
     GROUP BY a.id`,
    [id],
  );

  if (!article.length) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const result = article[0];
  result.categories = result.categories
    ? JSON.parse(result.categories).filter((cat) => cat.name !== null)
    : [];
  result.category_ids = result.categories.map((cat) => cat.id);

  return NextResponse.json(result);
}
