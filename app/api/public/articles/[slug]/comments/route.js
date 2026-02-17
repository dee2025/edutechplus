import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const param = await params;
    const slug = param.slug;

    const [[article]] = await pool.execute(
      'SELECT id FROM articles WHERE slug = ? AND status = "published"',
      [slug],
    );
    if (!article)
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 },
      );

    const [rows] = await pool.execute(
      `SELECT c.id, c.content, c.parent_id, c.created_at, u.id AS user_id, u.name AS user_name, u.avatar_url
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.article_id = ? AND c.is_deleted = 0 AND c.is_approved = 1
       ORDER BY c.created_at ASC`,
      [article.id],
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from email
    const [[user]] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [session.user.email],
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    const param = await params;
    const slug = param.slug;

    const [[article]] = await pool.execute(
      'SELECT id FROM articles WHERE slug = ? AND status = "published"',
      [slug],
    );
    if (!article)
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 },
      );

    const { content, parent_id } = await req.json();

    // Basic validation
    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: "Content required" },
        { status: 400 },
      );
    }

    // Rate limiting: max 5 comments/minute and 1 comment every 15 seconds per user
    const [[recentCount]] = await pool.execute(
      "SELECT COUNT(*) AS cnt FROM comments WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)",
      [userId],
    );
    if (recentCount.cnt >= 5) {
      return NextResponse.json(
        { message: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    const [lastRow] = await pool.execute(
      "SELECT created_at FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId],
    );
    if (lastRow && lastRow.length && lastRow[0].created_at) {
      const last = new Date(lastRow[0].created_at);
      const diff = (Date.now() - last.getTime()) / 1000;
      if (diff < 15) {
        return NextResponse.json(
          { message: "Please wait before posting another comment" },
          { status: 429 },
        );
      }
    }

    // Sanitize content to prevent XSS and strip disallowed tags
    let sanitizedContent = content;
    try {
      const DOMPurify = (await import("isomorphic-dompurify")).default;
      if (DOMPurify && typeof DOMPurify.sanitize === "function") {
        sanitizedContent = DOMPurify.sanitize(content, {
          USE_PROFILES: { html: true },
        });
      }
    } catch (e) {
      // if sanitizer fails, fall back to plain text stripping
      sanitizedContent = content.replace(/<[^>]*>?/gm, "");
    }

    // Limit content length
    if (sanitizedContent.length > 2000) {
      return NextResponse.json(
        { message: "Content too long" },
        { status: 400 },
      );
    }

    // Validate parent_id if present (must be an existing comment on same article)
    if (parent_id) {
      const [[parent]] = await pool.execute(
        "SELECT id FROM comments WHERE id = ? AND article_id = ? AND is_deleted = 0",
        [parent_id, article.id],
      );
      if (!parent) {
        return NextResponse.json(
          { message: "Invalid parent comment" },
          { status: 400 },
        );
      }
    }

    try {
      const [result] = await pool.execute(
        "INSERT INTO comments (article_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)",
        [article.id, userId, parent_id || null, sanitizedContent],
      );

      return NextResponse.json({
        message: "Comment added",
        comment_id: result.insertId,
      });
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        {
          message:
            "Failed to create comment. Confirm DB has `comments` table via migration.",
        },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
