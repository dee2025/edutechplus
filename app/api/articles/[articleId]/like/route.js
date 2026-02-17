import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// POST - Like an article
export async function POST(req, { params }) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const resolvedParams = await params;
    const articleId = resolvedParams.articleId;

    // Get user ID
    const users = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    // Check if article exists
    const articles = await query({
      query: "SELECT id FROM articles WHERE id = ?",
      values: [articleId],
    });

    if (articles.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Insert like (ignore if already exists due to UNIQUE constraint)
    await query({
      query:
        "INSERT IGNORE INTO article_likes (article_id, user_id) VALUES (?, ?)",
      values: [articleId, userId],
    });

    // Get total likes count
    const likesCount = await query({
      query: "SELECT COUNT(*) as count FROM article_likes WHERE article_id = ?",
      values: [articleId],
    });

    return NextResponse.json({
      success: true,
      liked: true,
      likesCount: likesCount[0].count,
    });
  } catch (error) {
    console.error("Error liking article:", error);
    return NextResponse.json(
      { error: "Failed to like article" },
      { status: 500 },
    );
  }
}

// DELETE - Unlike an article
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const resolvedParams = await params;
    const articleId = resolvedParams.articleId;

    // Get user ID
    const users = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    // Delete like
    await query({
      query: "DELETE FROM article_likes WHERE article_id = ? AND user_id = ?",
      values: [articleId, userId],
    });

    // Get total likes count
    const likesCount = await query({
      query: "SELECT COUNT(*) as count FROM article_likes WHERE article_id = ?",
      values: [articleId],
    });

    return NextResponse.json({
      success: true,
      liked: false,
      likesCount: likesCount[0].count,
    });
  } catch (error) {
    console.error("Error unliking article:", error);
    return NextResponse.json(
      { error: "Failed to unlike article" },
      { status: 500 },
    );
  }
}

// GET - Check if user has liked article and get likes count
export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const articleId = resolvedParams.articleId;
    const session = await getServerSession();

    let isLiked = false;

    if (session?.user?.email) {
      // Get user ID
      const users = await query({
        query: "SELECT id FROM users WHERE email = ?",
        values: [session.user.email],
      });

      if (users.length > 0) {
        const userId = users[0].id;

        // Check if user has liked this article
        const likes = await query({
          query:
            "SELECT id FROM article_likes WHERE article_id = ? AND user_id = ?",
          values: [articleId, userId],
        });

        isLiked = likes.length > 0;
      }
    }

    // Get total likes count
    const likesCount = await query({
      query: "SELECT COUNT(*) as count FROM article_likes WHERE article_id = ?",
      values: [articleId],
    });

    return NextResponse.json({
      isLiked,
      likesCount: likesCount[0].count,
    });
  } catch (error) {
    console.error("Error getting like status:", error);
    return NextResponse.json(
      { error: "Failed to get like status" },
      { status: 500 },
    );
  }
}
