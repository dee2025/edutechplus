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
    // Total views all time
    const [[totalViews]] = await pool.execute(
      `SELECT COUNT(*) as count FROM article_views`,
    );

    // Views today
    const [[todayViews]] = await pool.execute(
      `SELECT COUNT(*) as count FROM article_views WHERE created_at >= CURDATE()`,
    );

    // Views this week
    const [[weekViews]] = await pool.execute(
      `SELECT COUNT(*) as count FROM article_views 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
    );

    // Views this month
    const [[monthViews]] = await pool.execute(
      `SELECT COUNT(*) as count FROM article_views 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
    );

    // Authenticated vs anonymous
    const [[authBreakdown]] = await pool.execute(
      `SELECT 
        SUM(CASE WHEN is_authenticated = TRUE THEN 1 ELSE 0 END) as auth_views,
        SUM(CASE WHEN is_authenticated = FALSE THEN 1 ELSE 0 END) as anon_views
       FROM article_views`,
    );

    // Today breakdown
    const [[todayBreakdown]] = await pool.execute(
      `SELECT 
        SUM(CASE WHEN is_authenticated = TRUE THEN 1 ELSE 0 END) as auth_views,
        SUM(CASE WHEN is_authenticated = FALSE THEN 1 ELSE 0 END) as anon_views
       FROM article_views WHERE created_at >= CURDATE()`,
    );

    // Unique visitors (7d)
    const [[uniqueVisitors]] = await pool.execute(
      `SELECT 
        COUNT(DISTINCT user_id) as authenticated_users,
        COUNT(DISTINCT ip) as unique_ips
       FROM article_views 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
    );

    // Most viewed article
    const [topArticle] = await pool.execute(
      `SELECT a.id, a.title, a.slug, COUNT(*) as views
       FROM article_views av
       JOIN articles a ON a.id = av.article_id
       GROUP BY a.id
       ORDER BY views DESC
       LIMIT 1`,
    );

    // Articles viewed today
    const [[articlesViewedToday]] = await pool.execute(
      `SELECT COUNT(DISTINCT article_id) as count FROM article_views 
       WHERE created_at >= CURDATE()`,
    );

    return NextResponse.json({
      total_views: totalViews?.count || 0,
      today_views: todayViews?.count || 0,
      week_views: weekViews?.count || 0,
      month_views: monthViews?.count || 0,
      auth_breakdown: {
        authenticated: authBreakdown?.auth_views || 0,
        anonymous: authBreakdown?.anon_views || 0,
      },
      today_breakdown: {
        authenticated: todayBreakdown?.auth_views || 0,
        anonymous: todayBreakdown?.anon_views || 0,
      },
      unique_visitors: {
        authenticated_users: uniqueVisitors?.authenticated_users || 0,
        unique_ips: uniqueVisitors?.unique_ips || 0,
      },
      top_article: topArticle?.[0] || null,
      articles_viewed_today: articlesViewedToday?.count || 0,
    });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
