import { verifyToken } from "@/lib/auth";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json(null);

    const payload = await verifyToken(token);
    const userId = payload.id;

    const [rows] = await pool.execute(
      "SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?",
      [userId],
    );
    if (!rows.length) return NextResponse.json(null);

    return NextResponse.json(rows[0]);
  } catch (err) {
    return NextResponse.json(null);
  }
}
