import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const prarm = await params;
  const slug = prarm.slug;

  try {
    // 📰 Article + Author + Tags + Views
    const [[article]] = await pool.execute(
      `
          SELECT 
              a.*,
              COALESCE(u.name, ad.name) AS author_name,
              COALESCE(u.username, u.user_slug, ad.user_slug) AS author_username,
              COALESCE(u.user_slug, ad.user_slug) AS author_slug,
              COALESCE(u.avatar_url, ad.avatar) AS author_avatar,
              (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) AS views
          FROM articles a
          LEFT JOIN users u ON u.id = a.author_id
          LEFT JOIN admins ad ON ad.id = a.author_id
          WHERE a.slug = ? AND a.status = 'published' AND a.created_by_role = 'user'
          `,
      [slug],
    );

    if (!article) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Fetch tags for this article
    const [tags] = await pool.execute(
      `
        SELECT t.id, t.name, t.slug, t.color
        FROM tags t
        INNER JOIN article_tags at ON at.tag_id = t.id
        WHERE at.article_id = ?
        ORDER BY t.name ASC
      `,
      [article.id],
    );

    article.tags = tags;

    // 🔥 Trending articles (sidebar) - should use views, not just recent
    const [trending] = await pool.execute(
      `
          SELECT 
              a.id, a.title, a.slug,
              (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) AS views
          FROM articles a
          WHERE a.status = 'published' AND a.created_by_role = 'user' AND a.id != ?
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
