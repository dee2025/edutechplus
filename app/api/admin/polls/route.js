import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // list polls with options
    const [polls] = await pool.execute(
      "SELECT id, slug, question, is_active, start_at, end_at, created_at FROM polls ORDER BY created_at DESC",
    );

    // fetch options per poll
    const results = [];
    for (const p of polls) {
      const [opts] = await pool.execute(
        "SELECT id, label, votes_count, sort_order FROM poll_options WHERE poll_id = ? ORDER BY sort_order, id",
        [p.id],
      );
      results.push({ ...p, options: opts });
    }

    return NextResponse.json({ polls: results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      question,
      slug: incomingSlug,
      options,
      is_active = 1,
      start_at = null,
      end_at = null,
    } = body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { message: "Invalid payload. Need question and at least 2 options." },
        { status: 400 },
      );
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const slug = incomingSlug
        ? await (await import("@/lib/slugify")).default(incomingSlug)
        : await (await import("@/lib/slugify")).default(question.slice(0, 140));

      const [res] = await conn.execute(
        "INSERT INTO polls (slug, question, is_active, start_at, end_at) VALUES (?, ?, ?, ?, ?)",
        [slug, question, is_active ? 1 : 0, start_at, end_at],
      );
      const pollId = res.insertId;

      const opts = options.map((o, i) => [
        pollId,
        o.label || o,
        o.sort_order ?? i,
      ]);
      if (opts.length > 0) {
        await conn.query(
          "INSERT INTO poll_options (poll_id, label, sort_order) VALUES ?",
          [opts],
        );
      }

      await conn.commit();

      return NextResponse.json(
        { message: "Poll created", pollId },
        { status: 201 },
      );
    } catch (err) {
      await conn.rollback();
      console.error(err);
      return NextResponse.json({ message: "Server error" }, { status: 500 });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
}
