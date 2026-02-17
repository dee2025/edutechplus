import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized - please login" },
        { status: 401 },
      );
    }

    // Get user ID from database
    const users = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;
    const {
      title,
      subtitle,
      content,
      excerpt,
      tags,
      featured_image,
      seo_title,
      seo_description,
    } = await req.json();

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 },
      );
    }

    if (title.trim().length > 255) {
      return NextResponse.json(
        { message: "Title must be 255 characters or less" },
        { status: 400 },
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 },
      );
    }

    // Validate optional field lengths
    if (subtitle && subtitle.trim().length > 255) {
      return NextResponse.json(
        { message: "Subtitle must be 255 characters or less" },
        { status: 400 },
      );
    }

    if (seo_title && seo_title.trim().length > 255) {
      return NextResponse.json(
        { message: "SEO title must be 255 characters or less" },
        { status: 400 },
      );
    }

    if (seo_description && seo_description.trim().length > 320) {
      return NextResponse.json(
        { message: "SEO description must be 320 characters or less" },
        { status: 400 },
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Check if slug already exists
    const existingArticle = await query({
      query: "SELECT id FROM articles WHERE slug = ?",
      values: [slug],
    });

    if (existingArticle.length > 0) {
      return NextResponse.json(
        { message: "An article with this title already exists" },
        { status: 400 },
      );
    }

    // Create article - directly published for users
    const result = await query({
      query: `
        INSERT INTO articles (
          title, slug, subtitle, excerpt, content, 
          featured_image, author_id, status, 
          seo_title, seo_description, published_at, created_at, created_by_role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, NOW(), NOW(), 'user')
      `,
      values: [
        title.trim(),
        slug,
        subtitle?.trim() || null,
        excerpt?.trim() || null,
        content.trim(),
        featured_image || null,
        userId,
        seo_title?.trim() || title.trim(),
        seo_description?.trim() || excerpt?.trim() || null,
      ],
    });

    const articleId = result.insertId;

    // Handle tags
    if (Array.isArray(tags) && tags.length > 0) {
      // Limit to 5 tags
      const limitedTags = tags.slice(0, 5);

      for (const tagName of limitedTags) {
        try {
          // Generate slug for the tag
          const tagSlug = tagName
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

          // Check if tag exists, if not create it
          let tagId;
          const existingTag = await query({
            query: "SELECT id FROM tags WHERE name = ? OR slug = ?",
            values: [tagName, tagSlug],
          });

          if (existingTag.length > 0) {
            tagId = existingTag[0].id;
          } else {
            // Create new tag
            const newTag = await query({
              query: "INSERT INTO tags (name, slug, color) VALUES (?, ?, ?)",
              values: [tagName, tagSlug, "#06B6D4"],
            });
            tagId = newTag.insertId;
          }

          // Link tag to article
          await query({
            query:
              "INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)",
            values: [articleId, tagId],
          });
        } catch (tagErr) {
          console.error("Error processing tag:", tagName, tagErr);
          // Continue with other tags even if one fails
        }
      }
    }

    return NextResponse.json({
      message: "Article published successfully",
      article_id: articleId,
      slug: slug,
    });
  } catch (err) {
    console.error("Error creating article:", err);

    // Handle specific database errors
    if (err.code === "ER_DATA_TOO_LONG") {
      return NextResponse.json(
        { message: "One or more fields exceed the maximum allowed length" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: err.message || "Failed to create article" },
      { status: 500 },
    );
  }
}
