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

  // Ensure the article_views table exists (safe no-op)
  // await pool.execute(`
  //   CREATE TABLE IF NOT EXISTS article_views (
  //     id INT AUTO_INCREMENT PRIMARY KEY,
  //     article_id INT NOT NULL,
  //     user_id INT DEFAULT NULL,
  //     ip VARCHAR(45) DEFAULT NULL,
  //     user_agent VARCHAR(512) DEFAULT NULL,
  //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  //     INDEX idx_article_created (article_id, created_at),
  //     INDEX idx_user_created (user_id, created_at),
  //     INDEX idx_ip_created (ip, created_at)
  //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  // `);

  // Run metrics queries
  const [[totalArticlesRow]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM articles`,
  );
  const [[publishedRow]] = await pool.execute(
    `SELECT COUNT(*) AS published FROM articles WHERE status = 'published'`,
  );
  const [[categoriesRow]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM categories`,
  );

  const [[viewsTodayRow]] = await pool.execute(
    `SELECT COUNT(*) AS views_today FROM article_views WHERE created_at >= CURDATE()`,
  );

  const [[views7Row]] = await pool.execute(
    `SELECT COUNT(*) AS views_7d FROM article_views WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
  );

  const [[viewsTotalRow]] = await pool.execute(
    `SELECT COUNT(*) AS views_total FROM article_views`,
  );

  // unique logged-in users in last 7d
  const [[uniqueUsers7]] = await pool.execute(
    `SELECT COUNT(DISTINCT user_id) AS unique_user_views_7d FROM article_views WHERE user_id IS NOT NULL AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
  );

  const [topArticles] = await pool.execute(
    `
      SELECT a.id, a.title, a.slug, c.slug AS category_slug, IFNULL(v.views,0) AS views
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
      LEFT JOIN (
          SELECT article_id, COUNT(*) AS views
          FROM article_views
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY article_id
      ) v ON v.article_id = a.id
      WHERE a.status = 'published'
      ORDER BY v.views DESC
      LIMIT 5
    `,
  );

  const metrics = {
    total_articles: totalArticlesRow.total || 0,
    published: publishedRow.published || 0,
    categories: categoriesRow.total || 0,
    views_today: viewsTodayRow.views_today || 0,
    views_7d: views7Row.views_7d || 0,
    views_total: viewsTotalRow.views_total || 0,
    unique_user_views_7d: uniqueUsers7.unique_user_views_7d || 0,
    top_articles: topArticles || [],
  };

  return NextResponse.json(metrics);
}
