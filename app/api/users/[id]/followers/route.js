import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const offset = parseInt(req.nextUrl.searchParams.get("offset")) || 0;
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit")) || 20, 100);

    // Get followers of a user
    const followers = await query({
      query: `
        SELECT 
          u.id, u.name, u.email, u.avatar_url, u.bio,
          COUNT(DISTINCT ufo.following_id) as following_count
        FROM users u
        INNER JOIN user_follows uf ON uf.follower_id = u.id
        LEFT JOIN user_follows ufo ON ufo.follower_id = u.id
        WHERE uf.following_id = ?
        GROUP BY u.id
        ORDER BY uf.created_at DESC
        LIMIT ? OFFSET ?
      `,
      values: [id, limit, offset],
    });

    // Get total count
    const countResult = await query({
      query: `
        SELECT COUNT(*) as total FROM user_follows WHERE following_id = ?
      `,
      values: [id],
    });

    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      followers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err) {
    console.error("Error fetching followers:", err);
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 }
    );
  }
}
