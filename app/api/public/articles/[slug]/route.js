import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const prarm = await params;
  const slug = prarm.slug;

  try {
    // Ensure article_views exists (safety)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS article_views (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        user_id INT DEFAULT NULL,
        ip VARCHAR(45) DEFAULT NULL,
        user_agent VARCHAR(512) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_article_created (article_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 📰 Article + Author + Category, plus aggregated views from article_views
    const [[article]] = await pool.query(
      `
          SELECT 
              a.*,
              ad.name AS author_name,
              c.name AS category_name,
              c.slug AS category_slug,
              IFNULL(av.views, 0) AS views
          FROM articles a
          JOIN admins ad ON ad.id = a.author_id
          LEFT JOIN categories c ON c.id = a.category_id
          LEFT JOIN (
              SELECT article_id, COUNT(*) AS views
              FROM article_views
              GROUP BY article_id
          ) av ON av.article_id = a.id
          WHERE a.slug = ? AND a.status = 'published'
          `,
      [slug],
    );

    if (!article) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // 🔥 Trending articles (sidebar)
    const [trending] = await pool.query(
      `
          SELECT id, title, slug
          FROM articles
          WHERE status = 'published'
          ORDER BY published_at DESC
          LIMIT 5
          `,
    );

    return NextResponse.json({
      article,
      trending,
    });
  } catch (err) {
    console.error("Error in public article route", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
