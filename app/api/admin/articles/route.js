import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("auth_token")?.value;
}

/**
 * GET: List articles (admin)
 */
export async function GET(req) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  jwt.verify(token, process.env.JWT_SECRET);

  const [rows] = await pool.query(`
        SELECT 
            a.id,
            a.title,
            a.slug,
            a.status,
            a.created_at,
            ad.name AS author_name,
            c.name AS category_name
        FROM articles a
        LEFT JOIN admins ad ON ad.id = a.author_id
        LEFT JOIN categories c ON c.id = a.category_id
        ORDER BY a.created_at DESC
    `);

  return NextResponse.json(rows);
}

/**
 * POST: Create article
 */
export async function POST(req) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const authorId = decoded.id; // ✅ admin id = author id
  const role = decoded.role;

  const {
    title,
    slug,
    excerpt,
    content,
    featured_image,
    seo_title,
    seo_description,
    read_time,
    category_id, // ✅ SINGLE CATEGORY
  } = await req.json();

  if (!title || !slug || !content) {
    return NextResponse.json(
      { message: "Title, slug and content are required" },
      { status: 400 },
    );
  }

  const status = role === "super_admin" ? "published" : "draft";
  const publishedAt = status === "published" ? new Date() : null;

  const [result] = await pool.query(
    `
        INSERT INTO articles
        (
            author_id,
            category_id,
            title,
            slug,
            excerpt,
            content,
            featured_image,
            status,
            published_at,
            seo_title,
            seo_description,
            read_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
    [
      authorId,
      category_id || null,
      title,
      slug,
      excerpt || null,
      content,
      featured_image || null,
      status,
      publishedAt,
      seo_title || null,
      seo_description || null,
      read_time || null,
    ],
  );

  if (result.affectedRows != 0) {
    const [updateTable] = await pool.query(
      `
        INSERT INTO article_flags
        (
            article_id
        )
        VALUES (?)
        `,
      [result.insertId],
    );
    if (updateTable.affectedRows == 0) {
      return NextResponse.json(
        { message: "Failed to create article flags" },
        { status: 500 },
      );
    }
  } else {
    return NextResponse.json(
      {
        message: "Failed to create article",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Article created",
    article_id: result.insertId,
  });
}
