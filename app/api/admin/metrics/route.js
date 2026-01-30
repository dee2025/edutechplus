import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("auth_token")?.value;
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

  // Ensure the article_views table exists (no-op if already present)
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS article_views (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       article_id INT NOT NULL,
//       ip VARCHAR(45) DEFAULT NULL,
//       user_agent VARCHAR(512) DEFAULT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     ) ENGINE=InnoDB;
//   `);

  // Run metrics queries
  const [[totalArticlesRow]] = await pool.query(`SELECT COUNT(*) AS total FROM articles`);
  const [[publishedRow]] = await pool.query(`SELECT COUNT(*) AS published FROM articles WHERE status = 'published'`);
  const [[categoriesRow]] = await pool.query(`SELECT COUNT(*) AS total FROM categories`);

  const [[viewsTodayRow]] = await pool.query(
    `SELECT COUNT(*) AS views_today FROM article_views WHERE created_at >= CURDATE()`,
  );

  const [[views7Row]] = await pool.query(
    `SELECT COUNT(*) AS views_7d FROM article_views WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
  );

  const [topArticles] = await pool.query(
    `
      SELECT a.id, a.title, a.slug, IFNULL(v.views,0) AS views
      FROM articles a
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
    top_articles: topArticles || [],
  };

  return NextResponse.json(metrics);
}
