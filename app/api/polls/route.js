import pool from "@/lib/db";
import slugify from "@/lib/slugify";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // only active polls within optional start/end
    const [polls] = await pool.execute(
      `SELECT id, slug, question, is_active, start_at, end_at, created_at FROM polls
       WHERE is_active = 1 AND (start_at IS NULL OR start_at <= NOW()) AND (end_at IS NULL OR end_at >= NOW())
       ORDER BY created_at DESC LIMIT 20`,
    );

    const response = NextResponse.json({ polls });

    // If visitor has no voter_token, generate a secure HttpOnly cookie so votes are unique and not JS-accessible
    try {
      const existing = req.cookies?.get?.("voter_token")?.value;
      if (!existing) {
        let newToken;
        if (globalThis.crypto && globalThis.crypto.randomUUID)
          newToken = globalThis.crypto.randomUUID();
        else {
          const { randomBytes } = await import("crypto");
          newToken = randomBytes(16).toString("hex");
        }
        response.cookies.set("voter_token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
      }
    } catch (cookieErr) {
      // non-fatal
      console.error("Failed to set voter_token cookie:", cookieErr);
    }

    return response;
  } catch (error) {
    console.error(error);
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
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const slug = incomingSlug
        ? slugify(incomingSlug)
        : slugify(question.slice(0, 140));

      const [res] = await conn.execute(
        "INSERT INTO polls (slug, question, is_active, start_at, end_at) VALUES (?, ?, ?, ?, ?)",
        [slug, question, is_active ? 1 : 0, start_at, end_at],
      );

      const pollId = res.insertId;

      // Insert options in bulk
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
