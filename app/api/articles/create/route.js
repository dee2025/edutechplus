import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized - please login" },
        { status: 401 }
      );
    }

    // Get user ID from database
    const users = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (users.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const userId = users[0].id;
    const { title, subtitle, content, excerpt, category_ids, featured_image, seo_title, seo_description } = await req.json();

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
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
        { status: 400 }
      );
    }

    // Create article - directly published for users
    const result = await query({
      query: `
        INSERT INTO articles (
          title, slug, subtitle, excerpt, content, 
          featured_image, author_id, status, 
          seo_title, seo_description, published_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, NOW(), NOW())
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

    // Add categories if provided
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      for (const catId of category_ids) {
        await query({
          query: "INSERT INTO article_categories (article_id, category_id) VALUES (?, ?)",
          values: [articleId, catId],
        });
      }
    }

    // Update user interests based on categories they write about
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      for (const catId of category_ids) {
        try {
          await query({
            query: `
              INSERT INTO user_interests (user_id, category_id, interest_score)
              VALUES (?, ?, 2.0)
              ON DUPLICATE KEY UPDATE
              interest_score = interest_score + 1.0
            `,
            values: [userId, catId],
          });
        } catch (e) {
          // Ignore errors for interest tracking
          console.error("Error updating user interests:", e);
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
    return NextResponse.json(
      { message: "Failed to create article" },
      { status: 500 }
    );
  }
}
