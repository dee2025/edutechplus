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
    const days = parseInt(url.searchParams.get("days")) || 30;

    // Views by date (last N days)
    const [viewsByDate] = await pool.execute(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as views,
        SUM(CASE WHEN is_authenticated = TRUE THEN 1 ELSE 0 END) as auth_views,
        SUM(CASE WHEN is_authenticated = FALSE THEN 1 ELSE 0 END) as anon_views,
        COUNT(DISTINCT article_id) as articles_viewed,
        COUNT(DISTINCT user_id) as authenticated_users
       FROM article_views
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [days],
    );

    // Views by hour (today)
    const [viewsByHour] = await pool.execute(
      `SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as views,
        SUM(CASE WHEN is_authenticated = TRUE THEN 1 ELSE 0 END) as auth_views,
        SUM(CASE WHEN is_authenticated = FALSE THEN 1 ELSE 0 END) as anon_views
       FROM article_views
       WHERE created_at >= CURDATE()
       GROUP BY HOUR(created_at)
       ORDER BY hour ASC`,
    );

    // Views by day of week (last 4 weeks)
    const [viewsByDayOfWeek] = await pool.execute(
      `SELECT 
        DAYNAME(created_at) as day_name,
        DAYOFWEEK(created_at) as day_num,
        COUNT(*) as views,
        ROUND(COUNT(*) / 4, 0) as avg_views
       FROM article_views
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 28 DAY)
       GROUP BY DAYOFWEEK(created_at)
       ORDER BY day_num ASC`,
    );

    return NextResponse.json({
      views_by_date: viewsByDate,
      views_by_hour: viewsByHour,
      views_by_day_of_week: viewsByDayOfWeek,
    });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
