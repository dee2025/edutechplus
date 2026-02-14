import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

export async function GET(req) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit")) || 50;

    // Recent views (last 50)
    const [recentViews] = await pool.execute(
      `SELECT 
        av.id,
        av.article_id,
        av.user_id,
        av.ip,
        av.user_agent,
        av.is_authenticated,
        av.created_at,
        a.title as article_title,
        a.slug as article_slug,
        c.name as category_name,
        c.slug as category_slug
       FROM article_views av
       JOIN articles a ON a.id = av.article_id
       LEFT JOIN categories c ON c.id = a.category_id
       ORDER BY av.created_at DESC
       LIMIT ?`,
      [limit],
    );

    // Today's activity summary
    const [[todayActivity]] = await pool.execute(
      `SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT article_id) as articles_viewed,
        COUNT(DISTINCT user_id) as authenticated_users,
        COUNT(DISTINCT ip) as unique_ips,
        MIN(created_at) as first_view,
        MAX(created_at) as last_view
       FROM article_views
       WHERE created_at >= CURDATE()`,
    );

    // Peak hour today
    const [peakHour] = await pool.execute(
      `SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as views
       FROM article_views
       WHERE created_at >= CURDATE()
       GROUP BY HOUR(created_at)
       ORDER BY views DESC
       LIMIT 1`,
    );

    // Most viewed article in last hour
    const [lastHourTopArticle] = await pool.execute(
      `SELECT 
        a.id,
        a.title,
        a.slug,
        COUNT(*) as views
       FROM article_views av
       JOIN articles a ON a.id = av.article_id
       WHERE av.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
       GROUP BY a.id
       ORDER BY views DESC
       LIMIT 1`,
    );

    return NextResponse.json({
      recent_views: recentViews,
      today_activity: todayActivity || {},
      peak_hour: peakHour?.[0] || null,
      last_hour_top_article: lastHourTopArticle?.[0] || null,
    });
  } catch (err) {
    console.error("Error fetching recent views:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
