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
    const period = url.searchParams.get("period") || "all"; // all, 7d, 30d

    let dateFilter = "";

    if (period === "7d") {
      dateFilter = "WHERE av.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    } else if (period === "30d") {
      dateFilter =
        "WHERE av.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    }

    const [categoryBreakdown] = await pool.execute(
      `SELECT 
        COALESCE(c.id, 0) as category_id,
        COALESCE(c.name, 'Uncategorized') as category_name,
        COALESCE(c.slug, 'uncategorized') as category_slug,
        COUNT(*) as total_views,
        COUNT(DISTINCT av.article_id) as articles_count,
        COUNT(DISTINCT av.user_id) as unique_authenticated,
        SUM(CASE WHEN av.is_authenticated = TRUE THEN 1 ELSE 0 END) as auth_views,
        SUM(CASE WHEN av.is_authenticated = FALSE THEN 1 ELSE 0 END) as anon_views,
        ROUND(COUNT(*) / COUNT(DISTINCT av.article_id), 1) as avg_views_per_article
       FROM article_views av
       JOIN articles a ON a.id = av.article_id
       LEFT JOIN categories c ON c.id = a.category_id
       ${dateFilter}
       GROUP BY COALESCE(c.id, 0), COALESCE(c.name, 'Uncategorized')
       ORDER BY total_views DESC`,
    );

    // Calculate total views for percentage
    const totalViews = categoryBreakdown.reduce(
      (sum, cat) => sum + cat.total_views,
      0,
    );

    // Add percentage to each category
    const categoryBreakdownWithPercent = categoryBreakdown.map((cat) => ({
      ...cat,
      percentage:
        totalViews > 0 ? ((cat.total_views / totalViews) * 100).toFixed(1) : 0,
    }));

    return NextResponse.json({
      period,
      total_views: totalViews,
      categories: categoryBreakdownWithPercent,
      count: categoryBreakdownWithPercent.length,
    });
  } catch (err) {
    console.error("Error fetching category breakdown:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
