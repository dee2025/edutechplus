import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("auth_token")?.value;
}

/**
 * GET: Single article
 */
export async function GET(req, { params }) {
  const param = await params;
  const id = param.id;

  const token = getToken(req);
  console.log(token);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  jwt.verify(token, process.env.JWT_SECRET);

  const [rows] = await pool.query("SELECT * FROM articles WHERE id = ?", [id]);

  if (!rows.length) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}

/**
 * PUT: Update article
 */
export async function PUT(req, { params }) {
  const param = await params;
  const id = param.id;
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const role = decoded.role;
  const adminId = decoded.id; // ✅ correct author id

  const {
    title,
    slug,
    excerpt,
    content,
    featured_image,
    status,
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

  // 🔐 Ownership check (EDITORS can edit only their articles)
  if (role === "editor") {
    const [[article]] = await pool.query(
      "SELECT author_id FROM articles WHERE id = ?",
      [id],
    );

    if (!article || article.author_id !== adminId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  }

  // 🛑 Editors cannot publish
  let finalStatus = status;
  let publishedAt = null;

  if (role === "editor") {
    finalStatus = "draft";
  }

  if (finalStatus === "published") {
    publishedAt = new Date();
  }

  await pool.query(
    `
        UPDATE articles
        SET
            title = ?,
            slug = ?,
            excerpt = ?,
            content = ?,
            featured_image = ?,
            category_id = ?,
            status = ?,
            published_at = ?,
            seo_title = ?,
            seo_description = ?,
            read_time = ?
        WHERE id = ?
        `,
    [
      title,
      slug,
      excerpt || null,
      content,
      featured_image || null,
      category_id || null,
      finalStatus,
      publishedAt,
      seo_title || null,
      seo_description || null,
      read_time || null,
      id,
    ],
  );

  return NextResponse.json({ message: "Article updated" });
}

/**
 * DELETE: Delete article (super_admin only)
 */
export async function DELETE(req, { params }) {
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

  await pool.query("DELETE FROM articles WHERE id = ?", [id]);

  await pool.query("DELETE FROM article_flags WHERE article_id = ?", [id]);

  return NextResponse.json({ message: "Article deleted" });
}
