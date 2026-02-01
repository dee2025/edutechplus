import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const pollId = params.id;
  try {
    // Recount votes per option based on poll_votes
    const [rows] = await pool.execute(
      `SELECT option_id, COUNT(*) as cnt FROM poll_votes WHERE poll_id = ? GROUP BY option_id`,
      [pollId],
    );

    const updates = (rows || []).map((r) => [r.cnt, r.option_id]);

    // Run updates in transaction
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const u of updates) {
        await conn.execute(
          "UPDATE poll_options SET votes_count = ? WHERE id = ?",
          u,
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      console.error(err);
      return NextResponse.json({ message: "Recount failed" }, { status: 500 });
    } finally {
      conn.release();
    }

    // Return updated options
    const [options] = await pool.execute(
      "SELECT id, label, votes_count FROM poll_options WHERE poll_id = ? ORDER BY sort_order, id",
      [pollId],
    );

    return NextResponse.json({ message: "Recounted", options });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
