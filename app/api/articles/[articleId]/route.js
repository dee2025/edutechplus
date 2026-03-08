import pool, { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  let connection;

  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { articleId } = await params;
    const parsedArticleId = Number.parseInt(articleId, 10);

    if (!Number.isFinite(parsedArticleId) || parsedArticleId <= 0) {
      return NextResponse.json(
        { message: "Invalid article id" },
        { status: 400 },
      );
    }

    const users = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (!users?.length) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const currentUserId = users[0].id;

    const articles = await query({
      query: "SELECT id, author_id FROM articles WHERE id = ? LIMIT 1",
      values: [parsedArticleId],
    });

    if (!articles?.length) {
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 },
      );
    }

    if (articles[0].author_id !== currentUserId) {
      return NextResponse.json(
        { message: "Forbidden: you can only delete your own article" },
        { status: 403 },
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute("DELETE FROM article_views WHERE article_id = ?", [
      parsedArticleId,
    ]);
    await connection.execute("DELETE FROM article_likes WHERE article_id = ?", [
      parsedArticleId,
    ]);
    await connection.execute("DELETE FROM article_tags WHERE article_id = ?", [
      parsedArticleId,
    ]);
    await connection.execute(
      "DELETE FROM article_categories WHERE article_id = ?",
      [parsedArticleId],
    );
    await connection.execute("DELETE FROM comments WHERE article_id = ?", [
      parsedArticleId,
    ]);
    await connection.execute(
      "DELETE FROM articles WHERE id = ? AND author_id = ?",
      [parsedArticleId, currentUserId],
    );

    await connection.commit();

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback errors and return the original error.
      }
    }

    console.error("Error deleting article:", error);
    return NextResponse.json(
      { message: "Failed to delete article" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
