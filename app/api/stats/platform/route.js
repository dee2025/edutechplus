import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Get total articles
    const articlesCount = await query({
      query:
        "SELECT COUNT(*) as count FROM articles WHERE status = 'published'",
      values: [],
    });

    // Get total users
    const usersCount = await query({
      query: "SELECT COUNT(*) as count FROM users",
      values: [],
    });

    // Get total views
    const viewsCount = await query({
      query: "SELECT COUNT(*) as count FROM article_views",
      values: [],
    });

    // Get total tags
    const tagsCount = await query({
      query: "SELECT COUNT(*) as count FROM tags",
      values: [],
    });

    // Get views today
    const viewsToday = await query({
      query: `
        SELECT COUNT(*) as count FROM article_views 
        WHERE DATE(created_at) = DATE(NOW())
      `,
      values: [],
    });

    // Get articles this week
    const articlesThisWeek = await query({
      query: `
        SELECT COUNT(*) as count FROM articles 
        WHERE status = 'published' 
        AND DATE(published_at) >= DATE_SUB(DATE(NOW()), INTERVAL 7 DAY)
      `,
      values: [],
    });

    // Get most active authors this week
    const topAuthors = await query({
      query: `
        SELECT 
          u.id, u.name, IFNULL(u.username, u.user_slug) as username, u.user_slug, u.avatar_url,
          COUNT(DISTINCT a.id) as article_count
        FROM users u
        LEFT JOIN articles a ON a.author_id = u.id AND a.status = 'published'
        WHERE a.published_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY u.id
        HAVING article_count > 0
        ORDER BY article_count DESC
        LIMIT 5
      `,
      values: [],
    });

    return NextResponse.json({
      stats: {
        total_articles: articlesCount[0]?.count || 0,
        total_users: usersCount[0]?.count || 0,
        total_views: viewsCount[0]?.count || 0,
        total_tags: tagsCount[0]?.count || 0,
        views_today: viewsToday[0]?.count || 0,
        articles_this_week: articlesThisWeek[0]?.count || 0,
        top_authors: topAuthors,
      },
    });
  } catch (err) {
    console.error("Error fetching platform stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
