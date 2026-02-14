import { verifyToken } from "@/lib/auth";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let payload;
    try {
      payload = await verifyToken(token);
    } catch (e) {
      // token invalid/expired
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = payload.id;

    const body = await req.json();
    const slug = (body.slug || "").trim();
    const title = body.title ? String(body.title).slice(0, 255) : null;

    if (!slug)
      return NextResponse.json({ message: "Missing slug" }, { status: 400 });

    // find article id if exists
    const [[article]] = await pool.execute(
      "SELECT id FROM articles WHERE slug = ? AND status = 'published'",
      [slug],
    );
    const articleId = article ? article.id : null;

    // insert or update (unique constraint prevents duplicates per day)
    try {
      const [res] = await pool.execute(
        `INSERT INTO user_reads (user_id, article_id, slug, title, read_date) VALUES (?, ?, ?, ?, CURDATE()) ON DUPLICATE KEY UPDATE created_at = NOW()`,
        [userId, articleId, slug, title],
      );

      // res may be an OkPacket with affectedRows/insertId (mysql2)
      const affected = res && (res.affectedRows || res.affected_rows || 0);
      console.debug("Recorded read", { userId, articleId, slug, affected });

      return NextResponse.json({
        message: "Recorded",
        userId,
        articleId,
        slug,
        affected,
      });
    } catch (dbErr) {
      console.error("DB error recording read:", dbErr);
      // don't propagate DB errors as 500 that leak details
      return NextResponse.json(
        { message: "Unable to record read" },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    const userId = payload.id;

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "180", 10) || 180;
    const listMode = url.searchParams.get("list");
    const limit = Math.min(
      100,
      parseInt(url.searchParams.get("limit") || "20", 10) || 20,
    );

    // compute start date (YYYY-MM-DD)
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    const startDate = start.toISOString().slice(0, 10);

    if (listMode) {
      const [rows] = await pool.execute(
        `SELECT ur.id, ur.article_id, ur.slug, ur.title, ur.read_date, ur.created_at, c.slug AS category_slug
         FROM user_reads ur
         LEFT JOIN articles a ON a.id = ur.article_id
         LEFT JOIN categories c ON c.id = a.category_id
         WHERE ur.user_id = ? AND ur.read_date >= ?
         ORDER BY ur.read_date DESC, ur.created_at DESC
         LIMIT ?`,
        [userId, startDate, limit],
      );

      const list = rows.map((r) => ({
        id: r.id,
        article_id: r.article_id || null,
        slug: r.slug,
        category_slug: r.category_slug || null,
        title: r.title || null,
        read_date:
          r.read_date instanceof Date
            ? r.read_date.toISOString().slice(0, 10)
            : String(r.read_date).slice(0, 10),
        created_at:
          r.created_at instanceof Date
            ? r.created_at.toISOString()
            : String(r.created_at || ""),
      }));

      // debug helper: when debug=1 return raw rows as well for inspection
      if (url.searchParams.get("debug") === "1") {
        return NextResponse.json({ list, raw: rows, total: list.length, days });
      }

      return NextResponse.json({ list, total: list.length, days });
    }

    const summary = url.searchParams.get("summary");

    if (summary === "streak") {
      const [rows2] = await pool.execute(
        `SELECT DISTINCT read_date FROM user_reads WHERE user_id = ? AND read_date >= ? ORDER BY read_date ASC`,
        [userId, startDate],
      );

      const dateSet = new Set(
        rows2.map((r) =>
          r.read_date instanceof Date
            ? r.read_date.toISOString().slice(0, 10)
            : String(r.read_date).slice(0, 10),
        ),
      );

      // best streak computation
      const datesArr = Array.from(dateSet).sort();
      let best = 0;
      let cur = 0;
      let prevMs = null;
      for (const ds of datesArr) {
        const ms = new Date(ds + "T00:00:00Z").getTime();
        if (prevMs !== null && ms === prevMs + 24 * 60 * 60 * 1000) {
          cur += 1;
        } else {
          cur = 1;
        }
        best = Math.max(best, cur);
        prevMs = ms;
      }

      // current streak ending today
      let current = 0;
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      while (true) {
        const key = d.toISOString().slice(0, 10);
        if (dateSet.has(key)) {
          current += 1;
          d.setDate(d.getDate() - 1);
        } else break;
      }

      return NextResponse.json({
        best_streak: best,
        current_streak: current,
        days,
      });
    }

    const [rows] = await pool.execute(
      `SELECT read_date, COUNT(*) AS cnt FROM user_reads WHERE user_id = ? AND read_date >= ? GROUP BY read_date`,
      [userId, startDate],
    );

    const counts = {};
    let total = 0;
    for (const r of rows) {
      const key =
        r.read_date instanceof Date
          ? r.read_date.toISOString().slice(0, 10)
          : String(r.read_date).slice(0, 10);
      counts[key] = r.cnt;
      total += r.cnt;
    }

    return NextResponse.json({ counts, total, days });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    const userId = payload.id;

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "0", 10) || 0;

    if (days > 0) {
      const start = new Date();
      start.setDate(start.getDate() - days + 1);
      const startDate = start.toISOString().slice(0, 10);
      const [res] = await pool.execute(
        `DELETE FROM user_reads WHERE user_id = ? AND read_date >= ?`,
        [userId, startDate],
      );
      return NextResponse.json({ deleted: res.affectedRows || 0 });
    }

    const [res] = await pool.execute(
      `DELETE FROM user_reads WHERE user_id = ?`,
      [userId],
    );
    return NextResponse.json({ deleted: res.affectedRows || 0 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
