import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const MIN_PUBLISHED_WORDS = 800;

function countWordsFromHtml(html) {
  if (!html) return 0;
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
}

function hasRequiredHeadings(html) {
  return /<h2\b|<h3\b/i.test(html || "");
}

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
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

  const [rows] = await pool.execute(`
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.featured_image,
        a.status,
        a.created_at,
        ad.name AS author_name,
        JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'name', c.name)) AS categories
      FROM articles a
      LEFT JOIN admins ad ON ad.id = a.author_id
      LEFT JOIN article_categories ac ON ac.article_id = a.id
      LEFT JOIN categories c ON c.id = ac.category_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

  // Parse categories JSON for each article
  const parsedRows = rows.map((row) => ({
    ...row,
    categories: row.categories
      ? JSON.parse(row.categories).filter((cat) => cat.name !== null)
      : [],
  }));

  return NextResponse.json(parsedRows);
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
    subtitle,
    canonical_url,
    tags,
    content_format,
    excerpt,
    content,
    featured_image,
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

  const status = role === "super_admin" ? "published" : "draft";
  const publishedAt = status === "published" ? new Date() : null;

  if (status === "published") {
    const wordCount = countWordsFromHtml(content);
    if (wordCount < MIN_PUBLISHED_WORDS) {
      return NextResponse.json(
        {
          message: `Published articles must be at least ${MIN_PUBLISHED_WORDS} words.`,
        },
        { status: 400 },
      );
    }

    if (!hasRequiredHeadings(content)) {
      return NextResponse.json(
        { message: "Published articles must include H2 or H3 headings." },
        { status: 400 },
      );
    }
  }

  let result;
  try {
    [result] = await pool.execute(
      `
        INSERT INTO articles
        (
            author_id,
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
            published_at,
            seo_title,
            seo_description,
            read_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        authorId,
        title,
        slug,
        subtitle || null,
        canonical_url || null,
        tags || null,
        content_format || "html",
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
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        message:
          "Failed to create article. Confirm DB has the new columns via migration.",
      },
      { status: 500 },
    );
  }

  if (result.affectedRows != 0) {
    const articleId = result.insertId;

    // Insert categories into junction table
    if (
      category_ids &&
      Array.isArray(category_ids) &&
      category_ids.length > 0
    ) {
      for (const catId of category_ids) {
        await pool.execute(
          "INSERT INTO article_categories (article_id, category_id) VALUES (?, ?)",
          [articleId, catId],
        );
      }
    }

    const [updateTable] = await pool.execute(
      `
        INSERT INTO article_flags
        (
            article_id
        )
        VALUES (?)
        `,
      [articleId],
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
