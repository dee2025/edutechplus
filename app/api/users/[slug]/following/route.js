import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { slug } = params;
    const userId = parseInt(slug); // Expecting numeric ID

    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get("limit")) || 20,
      100
    );
    const offset = parseInt(req.nextUrl.searchParams.get("offset")) || 0;

    // Get users being followed
    const following = await query({
      query: `
        SELECT 
          u.id, u.name, u.email, u.avatar_url, u.bio, u.user_slug,
          COUNT(DISTINCT uf2.follower_id) as followers_count
        FROM user_follows uf
        INNER JOIN users u ON u.id = uf.following_id
        LEFT JOIN user_follows uf2 ON uf2.following_id = u.id
        WHERE uf.follower_id = ?
        GROUP BY u.id
        ORDER BY uf.created_at DESC
        LIMIT ? OFFSET ?
      `,
      values: [userId, limit, offset],
    });

    // Get total count
    const totalCount = await query({
      query: "SELECT COUNT(*) as count FROM user_follows WHERE follower_id = ?",
      values: [userId],
    });

    return NextResponse.json({
      following,
      pagination: {
        total: totalCount[0]?.count || 0,
        limit,
        offset,
        hasMore: offset + following.length < (totalCount[0]?.count || 0),
      },
    });
  } catch (err) {
    console.error("Error fetching following:", err);
    return NextResponse.json(
      { message: "Failed to fetch following" },
      { status: 500 }
    );
  }
}
