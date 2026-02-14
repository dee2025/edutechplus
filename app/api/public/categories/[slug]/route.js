import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const param = await params;
  const { slug } = param;

  // 📂 Category
  const [[category]] = await pool.execute(
    `SELECT id, name, slug, description
         FROM categories
         WHERE slug = ? AND is_active = 1`,
    [slug],
  );

  if (!category) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // 📰 Articles under category
  const [articles] = await pool.execute(
    `
        SELECT 
            a.id,
            a.title,
            a.slug,
            a.excerpt,
            a.featured_image,
            a.read_time,
            a.published_at,
            ad.name AS author_name,
            c.slug AS category_slug
        FROM articles a
        JOIN admins ad ON ad.id = a.author_id
        LEFT JOIN categories c ON c.id = a.category_id
        WHERE a.category_id = ?
          AND a.status = 'published'
        ORDER BY a.published_at DESC
        `,
    [category.id],
  );

  // 🔥 Trending (sidebar)
  const [trending] = await pool.execute(
    `
      SELECT a.id, a.title, a.slug, c.slug AS category_slug
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
        WHERE status = 'published'
        ORDER BY published_at DESC
        LIMIT 5
        `,
  );

  return NextResponse.json({
    category,
    articles,
    trending,
  });
}
