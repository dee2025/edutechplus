import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const pollId = params.id;
  try {
    const [polls] = await pool.execute(
      "SELECT id, slug, question, is_active, start_at, end_at, created_at FROM polls WHERE id = ? LIMIT 1",
      [pollId],
    );
    if (!polls || polls.length === 0) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }
    const poll = polls[0];
    const [options] = await pool.execute(
      "SELECT id, label, votes_count, sort_order FROM poll_options WHERE poll_id = ? ORDER BY sort_order, id",
      [pollId],
    );
    return NextResponse.json({ poll, options });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const pollId = params.id;
  try {
    const body = await req.json();
    const {
      question,
      slug,
      is_active = 1,
      start_at = null,
      end_at = null,
      options,
      forceDelete = false,
    } = body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { message: "Invalid payload: need question and at least 2 options" },
        { status: 400 },
      );
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Update poll meta (question, slug, active, dates)
      try {
        await conn.execute(
          "UPDATE polls SET question = ?, slug = ?, is_active = ?, start_at = ?, end_at = ? WHERE id = ?",
          [question, slug || null, is_active ? 1 : 0, start_at, end_at, pollId],
        );
      } catch (err) {
        // duplicate slug
        if (
          err &&
          (err.code === "ER_DUP_ENTRY" || (err.errno && err.errno === 1062))
        ) {
          await conn.rollback();
          return NextResponse.json(
            { message: "Slug already exists" },
            { status: 409 },
          );
        }
        throw err;
      }

      // Fetch existing options ids + votes_count
      const [existingRows] = await conn.execute(
        "SELECT id, votes_count FROM poll_options WHERE poll_id = ?",
        [pollId],
      );
      const existingIds = existingRows.map((r) => String(r.id));
      const existingVotes = Object.fromEntries(
        existingRows.map((r) => [String(r.id), Number(r.votes_count || 0)]),
      );

      // Apply updates / inserts (including sort_order)
      const incomingIds = [];
      for (const opt of options) {
        if (opt.id) {
          incomingIds.push(String(opt.id));
          await conn.execute(
            "UPDATE poll_options SET label = ?, sort_order = ? WHERE id = ? AND poll_id = ?",
            [opt.label, opt.sort_order || 0, opt.id, pollId],
          );
        } else {
          const [res] = await conn.execute(
            "INSERT INTO poll_options (poll_id, label, sort_order) VALUES (?, ?, ?)",
            [pollId, opt.label, opt.sort_order || 0],
          );
          incomingIds.push(String(res.insertId));
        }
      }

      // Delete removed options (those existing but not present in incoming)
      const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
      if (toDelete.length > 0) {
        // if any has votes and forceDelete not set, prevent deletion
        const idsWithVotes = toDelete.filter(
          (id) => (existingVotes[String(id)] || 0) > 0,
        );
        if (idsWithVotes.length > 0 && !forceDelete) {
          await conn.rollback();
          return NextResponse.json(
            {
              message: `Cannot delete options with votes: ${idsWithVotes.join(",")}. Set forceDelete=true to remove.`,
            },
            { status: 400 },
          );
        }

        const placeholders = toDelete.map(() => "?").join(",");
        await conn.query(
          `DELETE FROM poll_options WHERE id IN (${placeholders})`,
          toDelete,
        );
      }

      await conn.commit();

      // return updated data
      const [polls] = await pool.execute(
        "SELECT id, slug, question, is_active, start_at, end_at, created_at FROM polls WHERE id = ? LIMIT 1",
        [pollId],
      );
      const poll = polls[0];
      const [optionsUpdated] = await pool.execute(
        "SELECT id, label, votes_count, sort_order FROM poll_options WHERE poll_id = ? ORDER BY sort_order, id",
        [pollId],
      );

      return NextResponse.json({ poll, options: optionsUpdated });
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

export async function DELETE(req, { params }) {
  const pollId = params.id;
  try {
    await pool.execute("DELETE FROM polls WHERE id = ?", [pollId]);
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
