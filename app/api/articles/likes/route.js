import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET - Get all liked article IDs for current user
export async function GET(req) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ likedArticles: [] });
    }

    // Get user ID
    const users = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (users.length === 0) {
      return NextResponse.json({ likedArticles: [] });
    }

    const userId = users[0].id;

    // Get all article IDs that user has liked
    const likes = await query({
      query: "SELECT article_id FROM article_likes WHERE user_id = ?",
      values: [userId],
    });

    const likedArticles = likes.map((like) => like.article_id);

    return NextResponse.json({ likedArticles });
  } catch (error) {
    console.error("Error getting user likes:", error);
    return NextResponse.json(
      { error: "Failed to get user likes" },
      { status: 500 },
    );
  }
}
