import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const pollId = params.id;
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const perPage = parseInt(url.searchParams.get("per_page") || "50", 10);
    const offset = (page - 1) * perPage;

    const [rows] = await pool.execute(
      `SELECT pv.id, pv.poll_id, pv.option_id, pv.user_id, pv.voter_token, pv.ip, pv.user_agent, pv.created_at, po.label as option_label
       FROM poll_votes pv
       LEFT JOIN poll_options po ON po.id = pv.option_id
       WHERE pv.poll_id = ?
       ORDER BY pv.created_at DESC
       LIMIT ? OFFSET ?`,
      [pollId, perPage, offset],
    );

    return NextResponse.json({ votes: rows, page, perPage });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
