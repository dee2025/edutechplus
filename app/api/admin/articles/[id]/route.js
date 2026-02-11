import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

/**
 * GET: Single article
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
     LEFT JOIN categories ac ON ac.article_id = a.id
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
    subtitle,
    canonical_url,
    tags,
    content_format,
    excerpt,
    content,
    featured_image,
    status,
    seo_title,
    seo_description,
    read_time,
    category_ids, // ✅ MULTIPLE CATEGORIES (array)
  } = await req.json();

  if (!title || !slug || !content) {
    return NextResponse.json(
      { message: "Title, slug and content are required" },
      { status: 400 },
    );
  }

  // 🔐 Ownership check (EDITORS can edit only their articles)
  if (role === "editor") {
    const [[article]] = await pool.execute(
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

  try {
    await pool.execute(
      `
        UPDATE articles
        SET
            title = ?,
            slug = ?,
            subtitle = ?,
            canonical_url = ?,
            tags = ?,
            content_format = ?,
            excerpt = ?,
            content = ?,
            featured_image = ?,
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
        subtitle || null,
        canonical_url || null,
        tags || null,
        content_format || "html",
        excerpt || null,
        content,
        featured_image || null,
        finalStatus,
        publishedAt,
        seo_title || null,
        seo_description || null,
        read_time || null,
        id,
      ],
    );

    // Update categories: delete old ones and insert new ones
    await pool.execute("DELETE FROM categories WHERE article_id = ?", [id]);

    if (
      category_ids &&
      Array.isArray(category_ids) &&
      category_ids.length > 0
    ) {
      for (const catId of category_ids) {
        await pool.execute(
          "INSERT INTO categories (article_id, category_id) VALUES (?, ?)",
          [id, catId],
        );
      }
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        message:
          "Failed to update article. Confirm DB has the new columns via migration.",
      },
      { status: 500 },
    );
  }

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

  await pool.execute("DELETE FROM articles WHERE id = ?", [id]);

  await pool.execute("DELETE FROM article_flags WHERE article_id = ?", [id]);

  await pool.execute("DELETE FROM categories WHERE article_id = ?", [id]);

  return NextResponse.json({ message: "Article deleted" });
}
