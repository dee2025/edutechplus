import { verifyToken } from "@/lib/auth";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    const userId = payload.id;

    const param = await params;
    const slug = param.slug;
    const id = param.id;

    // ensure article exists
    const [[article]] = await pool.execute(
      'SELECT id FROM articles WHERE slug = ? AND status = "published"',
      [slug],
    );
    if (!article)
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 },
      );

    // ensure comment exists and belongs to article
    const [[comment]] = await pool.execute(
      "SELECT id, user_id, is_deleted FROM comments WHERE id = ? AND article_id = ?",
      [id, article.id],
    );
    if (!comment)
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 },
      );
    if (comment.is_deleted)
      return NextResponse.json({ message: "Comment deleted" }, { status: 410 });

    // only owner can edit
    if (comment.user_id !== userId)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { content } = await req.json();
    if (!content || !content.trim())
      return NextResponse.json(
        { message: "Content required" },
        { status: 400 },
      );

    // Rate limiting edits: max 10 edits across user's comments per minute
    const [[editCount]] = await pool.execute(
      "SELECT COUNT(*) AS cnt FROM comments WHERE user_id = ? AND updated_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)",
      [userId],
    );
    if (editCount.cnt >= 10) {
      return NextResponse.json(
        { message: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    // Sanitize content
    let sanitizedContent = content;
    try {
      const DOMPurify = (await import("isomorphic-dompurify")).default;
      if (DOMPurify && typeof DOMPurify.sanitize === "function") {
        sanitizedContent = DOMPurify.sanitize(content, {
          USE_PROFILES: { html: true },
        });
      }
    } catch (e) {
      sanitizedContent = content.replace(/<[^>]*>?/gm, "");
    }

    if (sanitizedContent.length > 2000) {
      return NextResponse.json(
        { message: "Content too long" },
        { status: 400 },
      );
    }

    await pool.execute(
      "UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?",
      [sanitizedContent, id],
    );

    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    const userId = payload.id;

    const param = await params;
    const slug = param.slug;
    const id = param.id;

    // ensure article exists
    const [[article]] = await pool.execute(
      'SELECT id FROM articles WHERE slug = ? AND status = "published"',
      [slug],
    );
    if (!article)
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 },
      );

    // ensure comment exists and belongs to article
    const [[comment]] = await pool.execute(
      "SELECT id, user_id, is_deleted FROM comments WHERE id = ? AND article_id = ?",
      [id, article.id],
    );
    if (!comment)
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 },
      );
    if (comment.is_deleted)
      return NextResponse.json(
        { message: "Comment already deleted" },
        { status: 410 },
      );

    // only owner can delete (soft-delete)
    if (comment.user_id !== userId)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await pool.execute("UPDATE comments SET is_deleted = 1 WHERE id = ?", [id]);

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
