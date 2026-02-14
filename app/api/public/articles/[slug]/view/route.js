import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const param = await params;
  const slug = param.slug;

  try {
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
          const verified = await (
            await import("@/lib/auth")
          ).verifyToken(token);
          userId = verified?.id || null;
        } catch (e) {
          // ignore invalid token
        }
      }
    } catch (e) {
      // ignore token lookup errors
    }

    let inserted = false;

    // Perform an atomic conditional insert to avoid race conditions
    // Priority: authenticated user > IP address > user agent > anonymous
    try {
      if (userId) {
        // 1. For logged-in users: one view per day per user
        const [res] = await pool.execute(
          `INSERT INTO article_views (article_id, user_id, ip, user_agent, is_authenticated)
           SELECT ?, ?, ?, ?, TRUE FROM DUAL
           WHERE NOT EXISTS (
             SELECT 1 FROM article_views WHERE article_id = ? AND user_id = ? AND created_at >= CURDATE()
           )`,
          [article.id, userId, ip, ua, article.id, userId],
        );
        inserted = (res?.affectedRows || res?.affected_rows || 0) > 0;
      } else if (ip) {
        // 2. For IP-identified users: one view per 24 hours per IP
        const [res] = await pool.execute(
          `INSERT INTO article_views (article_id, user_id, ip, user_agent, is_authenticated)
           SELECT ?, NULL, ?, ?, FALSE FROM DUAL
           WHERE NOT EXISTS (
             SELECT 1 FROM article_views WHERE article_id = ? AND ip = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
           )`,
          [article.id, ip, ua, article.id, ip],
        );
        inserted = (res?.affectedRows || res?.affected_rows || 0) > 0;
      } else if (ua) {
        // 3. For UA-only identified users: one view per hour per UA
        // (less reliable, used as fallback)
        const [res] = await pool.execute(
          `INSERT INTO article_views (article_id, user_id, ip, user_agent, is_authenticated)
           SELECT ?, NULL, NULL, ?, FALSE FROM DUAL
           WHERE NOT EXISTS (
             SELECT 1 FROM article_views WHERE article_id = ? AND user_agent = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
           )`,
          [article.id, ua, article.id, ua],
        );
        inserted = (res?.affectedRows || res?.affected_rows || 0) > 0;
      } else {
        // 4. No identifying info available (very rare - maybe browser privacy mode)
        // Insert as anonymous view
        await pool.execute(
          `INSERT INTO article_views (article_id, user_id, ip, user_agent, is_authenticated) 
           VALUES (?, NULL, NULL, NULL, FALSE)`,
          [article.id],
        );
        inserted = true;
      }
    } catch (dbErr) {
      // Don't fail the request if view insertion fails - still return current counts
    }

    // Get aggregated view counts
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
      return NextResponse.json({
        views_total,
        views_today,
        inserted,
        info: {
          userId: !!userId,
          ip: ip ? "yes" : "no",
          ua: ua ? "yes" : "no",
        },
      });
    }

    return NextResponse.json({ views: views_total, views_today });
  } catch (err) {
    return NextResponse.json(
      { message: "Error tracking view" },
      { status: 500 },
    );
  }
}
