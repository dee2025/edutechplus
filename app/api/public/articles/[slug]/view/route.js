import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const param = await params;
  const slug = param.slug;

  // Find article id (published)
  const [[article]] = await pool.query(
    `SELECT id FROM articles WHERE slug = ? AND status = 'published'`,
    [slug],
  );

  if (!article) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // Get client IP and UA
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : null;
  const ua = req.headers.get("user-agent") ?? null;

  let shouldInsert = true;

  // Deduplicate by IP within 24h when IP available
  if (ip) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS c FROM article_views WHERE article_id = ? AND ip = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      [article.id, ip],
    );

    if (rows && rows[0] && rows[0].c > 0) shouldInsert = false;
  } else if (ua) {
    // Fallback: dedupe by user-agent within 1 hour when IP not available
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS c FROM article_views WHERE article_id = ? AND user_agent = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [article.id, ua],
    );

    if (rows && rows[0] && rows[0].c > 0) shouldInsert = false;
  }

  if (shouldInsert) {
    await pool.query(
      `INSERT INTO article_views (article_id, ip, user_agent) VALUES (?, ?, ?)`,
      [article.id, ip, ua],
    );
  }

  // Return aggregated views
  const [countRows] = await pool.query(`SELECT COUNT(*) AS views FROM article_views WHERE article_id = ?`, [article.id]);
  const views = countRows && countRows[0] ? countRows[0].views : 0;

  return NextResponse.json({ views });
}
