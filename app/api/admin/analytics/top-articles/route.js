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
    const period = url.searchParams.get("period") || "all"; // all, 7d, 30d, today
    const limit = parseInt(url.searchParams.get("limit")) || 20;

    let dateFilter = "";
    const params = [limit];

    if (period === "today") {
      dateFilter = "WHERE av.created_at >= CURDATE()";
    } else if (period === "7d") {
      dateFilter = "WHERE av.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    } else if (period === "30d") {
      dateFilter =
        "WHERE av.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    }

    const [topArticles] = await pool.execute(
      `SELECT 
        a.id,
        a.title,
        a.slug,
        c.name as category,
        c.slug as category_slug,
        COUNT(*) as total_views,
        COUNT(DISTINCT av.user_id) as unique_authenticated,
        COUNT(DISTINCT av.ip) as unique_ips,
        SUM(CASE WHEN av.is_authenticated = TRUE THEN 1 ELSE 0 END) as auth_views,
        SUM(CASE WHEN av.is_authenticated = FALSE THEN 1 ELSE 0 END) as anon_views,
        a.published_at,
        MAX(av.created_at) as last_view
       FROM article_views av
       JOIN articles a ON a.id = av.article_id
       LEFT JOIN categories c ON c.id = a.category_id
       ${dateFilter}
       GROUP BY a.id
       ORDER BY total_views DESC
       LIMIT ?`,
      [limit],
    );

    return NextResponse.json({
      period,
      count: topArticles.length,
      articles: topArticles,
    });
  } catch (err) {
    console.error("Error fetching top articles:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
