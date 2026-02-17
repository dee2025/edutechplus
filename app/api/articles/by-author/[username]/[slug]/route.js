import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const param = await params;
  const username = param.username;
  const slug = param.slug;

  try {
    // 📰 Fetch article by author username + article slug
    const [[article]] = await pool.execute(
      `
        SELECT 
            a.*,
            u.id as author_id,
            u.name AS author_name,
            IFNULL(u.username, u.user_slug) AS author_username,
            u.user_slug AS author_slug,
            u.avatar_url AS author_avatar,
            u.bio,
            u.website,
            u.twitter,
            u.github,
            u.linkedin,
            c.name AS category_name,
            c.slug AS category_slug,
            (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) AS views,
            (SELECT COUNT(*) FROM user_follows WHERE follower_id = ? AND following_id = u.id) AS is_following
        FROM articles a
        LEFT JOIN users u ON u.id = a.author_id
        LEFT JOIN categories c ON c.id = a.category_id
        WHERE a.slug = ? 
          AND a.status = 'published'
          AND a.created_by_role = 'user'
          AND (u.username = ? OR u.user_slug = ?)
      `,
      [null, slug, username, username], // null for is_following in unauthenticated context
    );

    if (!article) {
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 },
      );
    }

    // 🔥 Trending articles (sidebar)
    const [trending] = await pool.execute(
      `
        SELECT 
            a.id, a.title, a.slug, 
            u.id as author_id, IFNULL(u.username, u.user_slug) as author_username, u.user_slug as author_slug, u.name,
            (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) AS views
        FROM articles a
        LEFT JOIN users u ON u.id = a.author_id
        WHERE a.status = 'published' AND a.created_by_role = 'user' AND a.id != ?
        ORDER BY (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) DESC
        LIMIT 5
      `,
      [article.id],
    );

    // Enable HTTP caching for public articles
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
    console.error("Error fetching article by author:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
