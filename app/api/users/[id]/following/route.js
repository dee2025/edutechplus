import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const offset = parseInt(req.nextUrl.searchParams.get("offset")) || 0;
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit")) || 20, 100);

    // Get users that this user is following
    const following = await query({
      query: `
        SELECT 
          u.id, u.name, u.email, u.avatar_url, u.bio,
          COUNT(DISTINCT uf.follower_id) as followers_count
        FROM users u
        INNER JOIN user_follows ufo ON ufo.following_id = u.id
        LEFT JOIN user_follows uf ON uf.following_id = u.id
        WHERE ufo.follower_id = ?
        GROUP BY u.id
        ORDER BY ufo.created_at DESC
        LIMIT ? OFFSET ?
      `,
      values: [id, limit, offset],
    });

    // Get total count
    const countResult = await query({
      query: `
        SELECT COUNT(*) as total FROM user_follows WHERE follower_id = ?
      `,
      values: [id],
    });

    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      following,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err) {
    console.error("Error fetching following:", err);
    return NextResponse.json(
      { error: "Failed to fetch following" },
      { status: 500 }
    );
  }
}
