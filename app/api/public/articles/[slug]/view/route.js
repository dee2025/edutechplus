import pool from "@/lib/db";
import { NextResponse } from "next/server";

async function getArticleBySlug(slug) {
  const [[article]] = await pool.execute(
    `SELECT id FROM articles WHERE slug = ? AND status = 'published'`,
    [slug],
  );
  return article;
}

async function getViewCounts(articleId) {
  const [[totalRow]] = await pool.execute(
    `SELECT COUNT(*) AS views_total FROM article_views WHERE article_id = ?`,
    [articleId],
  );
  const [[todayRow]] = await pool.execute(
    `SELECT COUNT(*) AS views_today FROM article_views WHERE article_id = ? AND created_at >= CURDATE()`,
    [articleId],
  );

  return {
    views_total: Number(totalRow?.views_total || 0),
    views_today: Number(todayRow?.views_today || 0),
  };
}

export async function GET(_req, { params }) {
  const param = await params;
  const slug = param.slug;

  try {
    const article = await getArticleBySlug(slug);
    if (!article) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const counts = await getViewCounts(article.id);
    return NextResponse.json({
      views: counts.views_total,
      views_today: counts.views_today,
    });
  } catch {
    return NextResponse.json(
      { message: "Error fetching views" },
      { status: 500 },
    );
  }
}

export async function POST(req, { params }) {
  const param = await params;
  const slug = param.slug;

  try {
    const article = await getArticleBySlug(slug);
    if (!article) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

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
        } catch {
          // Ignore invalid token.
        }
      }
    } catch {
      // Ignore token lookup errors.
    }

    let inserted = false;

    try {
      if (userId) {
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
        await pool.execute(
          `INSERT INTO article_views (article_id, user_id, ip, user_agent, is_authenticated)
           VALUES (?, NULL, NULL, NULL, FALSE)`,
          [article.id],
        );
        inserted = true;
      }
    } catch {
      // Don't fail request on insert errors; still return latest counts.
    }

    if (userId && inserted) {
      try {
        const db = (await import("@/lib/db")).default;
        const [categories] = await db.execute(
          `SELECT category_id FROM article_categories WHERE article_id = ?`,
          [article.id],
        );

        for (const cat of categories) {
          await db
            .execute(
              `INSERT INTO user_interests (user_id, category_id, interest_score)
               VALUES (?, ?, 1.0)
               ON DUPLICATE KEY UPDATE interest_score = interest_score + 1.0`,
              [userId, cat.category_id],
            )
            .catch(() => {
              // Ignore interest tracking errors.
            });
        }
      } catch {
        // Ignore interest tracking errors.
      }
    }

    const counts = await getViewCounts(article.id);

    const url = new URL(req.url);
    if (url.searchParams.get("debug") === "1") {
      return NextResponse.json({
        views_total: counts.views_total,
        views_today: counts.views_today,
        inserted,
        info: {
          userId: !!userId,
          ip: ip ? "yes" : "no",
          ua: ua ? "yes" : "no",
        },
      });
    }

    return NextResponse.json({
      views: counts.views_total,
      views_today: counts.views_today,
    });
  } catch {
    return NextResponse.json(
      { message: "Error tracking view" },
      { status: 500 },
    );
  }
}
