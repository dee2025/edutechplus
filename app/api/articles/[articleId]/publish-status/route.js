import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user - check if admin
    const users = await query({
      query: "SELECT id, role FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (
      users.length === 0 ||
      !["super_admin", "editor", "admin"].includes(users[0].role)
    ) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    const { articleId } = await params;
    const { status } = await req.json();

    if (!["published", "unpublished", "draft"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status. Use: published, unpublished, or draft" },
        { status: 400 },
      );
    }

    // Determine published_at based on status
    let publishedAt = null;
    if (status === "published") {
      publishedAt = new Date();
    }

    // Update article status
    const result = await query({
      query: "UPDATE articles SET status = ?, published_at = ? WHERE id = ?",
      values: [status, publishedAt, articleId],
    });

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: `Article ${status}`,
      article_id: articleId,
      status: status,
    });
  } catch (err) {
    console.error("Error updating article status:", err);
    return NextResponse.json(
      { message: "Failed to update article" },
      { status: 500 },
    );
  }
}
