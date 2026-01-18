import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const prarm = await params;
  const slug = prarm.slug;

  // 📰 Article + Author + Category
  const [[article]] = await pool.query(
    `
        SELECT 
            a.id,
            a.title,
            a.slug,
            a.excerpt,
            a.content,
            a.featured_image,
            a.read_time,
            a.published_at,
            ad.name AS author_name,
            c.name AS category_name,
            c.slug AS category_slug
        FROM articles a
        JOIN admins ad ON ad.id = a.author_id
        LEFT JOIN categories c ON c.id = a.category_id
        WHERE a.slug = ? AND a.status = 'published'
        `,
    [slug],
  );

  console.log("Article data:", article);

  if (!article) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // 🔥 Trending articles (sidebar)
  const [trending] = await pool.query(
    `
        SELECT id, title, slug
        FROM articles
        WHERE status = 'published'
        ORDER BY published_at DESC
        LIMIT 5
        `,
  );

  return NextResponse.json({
    article,
    trending,
  });
}
