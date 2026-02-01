import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const param = await params;
  const slug = param.slug;

  // Ensure table exists (safe no-op if created by migration)
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

  // Find article id (published)
  const [[article]] = await pool.execute(
    `SELECT id FROM articles WHERE slug = ? AND status = 'published'`,
    [slug],
  );

  if (!article) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // Get client IP, UA and (if present) user
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : null;
  const ua = req.headers.get("user-agent") ?? null;

  let userId = null;
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (token) {
      try {
        const verified = await (await import("@/lib/auth")).verifyToken(token);
        userId = verified?.id || null;
      } catch (e) {
        // ignore invalid token
      }
    }
  } catch (e) {
    // ignore token lookup errors
  }

  let inserted = false;

  // Perform an atomic conditional insert to avoid race conditions that can lead to duplicate rows
  try {
    if (userId) {
      const [res] = await pool.execute(
        `INSERT INTO article_views (article_id, user_id, ip, user_agent)
         SELECT ?, ?, ?, ? FROM DUAL
         WHERE NOT EXISTS (
           SELECT 1 FROM article_views WHERE article_id = ? AND user_id = ? AND created_at >= CURDATE()
         )`,
        [article.id, userId, ip, ua, article.id, userId],
      );
      if (res && (res.affectedRows || res.affected_rows || 0) > 0)
        inserted = true;
    } else if (ip) {
      const [res] = await pool.execute(
        `INSERT INTO article_views (article_id, user_id, ip, user_agent)
         SELECT ?, NULL, ?, ? FROM DUAL
         WHERE NOT EXISTS (
           SELECT 1 FROM article_views WHERE article_id = ? AND ip = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
         )`,
        [article.id, ip, ua, article.id, ip],
      );
      if (res && (res.affectedRows || res.affected_rows || 0) > 0)
        inserted = true;
    } else if (ua) {
      const [res] = await pool.execute(
        `INSERT INTO article_views (article_id, user_id, ip, user_agent)
         SELECT ?, NULL, NULL, ? FROM DUAL
         WHERE NOT EXISTS (
           SELECT 1 FROM article_views WHERE article_id = ? AND user_agent = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
         )`,
        [article.id, ua, article.id, ua],
      );
      if (res && (res.affectedRows || res.affected_rows || 0) > 0)
        inserted = true;
    } else {
      // No identifying token (very rare). Insert unconditionally.
      await pool.execute(
        `INSERT INTO article_views (article_id, user_id, ip, user_agent) VALUES (?, NULL, NULL, NULL)`,
        [article.id],
      );
      inserted = true;
    }
  } catch (dbErr) {
    console.error("DB error inserting view:", dbErr);
  }

  // Return aggregated views: total and today
  const [[totalRow]] = await pool.execute(
    `SELECT COUNT(*) AS views_total FROM article_views WHERE article_id = ?`,
    [article.id],
  );
  const [[todayRow]] = await pool.execute(
    `SELECT COUNT(*) AS views_today FROM article_views WHERE article_id = ? AND created_at >= CURDATE()`,
    [article.id],
  );

  const views_total = totalRow?.views_total || 0;
  const views_today = todayRow?.views_today || 0;

  // for dev help: if debug=1 return inserted flag
  const url = new URL(req.url);
  if (url.searchParams.get("debug") === "1") {
    return NextResponse.json({ views_total, views_today, inserted });
  }

  return NextResponse.json({ views: views_total, views_today });
}
