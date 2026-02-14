import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const prarm = await params;
  const slug = prarm.slug;

  try {
    // 📰 Article + Author + Category, plus aggregated views from article_views
    // Using a single optimized query instead of multiple queries
    const [[article]] = await pool.execute(
      `
          SELECT 
              a.*,
              ad.name AS author_name,
              c.name AS category_name,
              c.slug AS category_slug,
              (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) AS views
          FROM articles a
          JOIN admins ad ON ad.id = a.author_id
          LEFT JOIN categories c ON c.id = a.category_id
          WHERE a.slug = ? AND a.status = 'published'
          `,
      [slug],
    );

    if (!article) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // 🔥 Trending articles (sidebar) - should use views, not just recent
    const [trending] = await pool.execute(
      `
          SELECT 
              a.id, a.title, a.slug, c.slug AS category_slug,
              (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) AS views
          FROM articles a
          LEFT JOIN categories c ON c.id = a.category_id
          WHERE a.status = 'published' AND a.id != ?
          ORDER BY (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) DESC
          LIMIT 5
          `,
      [article.id],
    );

    // Enable HTTP caching for public articles (1 hour)
    return NextResponse.json(
      { article, trending },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
