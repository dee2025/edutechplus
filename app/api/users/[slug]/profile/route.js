import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { slug } = params;

    // Try to get user by slug first, then fallback to ID for backward compatibility
    let userQuery = `
      SELECT id FROM users WHERE user_slug = ?
    `;
    let userResult = await query({
      query: userQuery,
      values: [slug],
    });

    let userId = userResult[0]?.id;

    // If not found by slug, try by ID (for backward compatibility)
    if (!userId) {
      const idResult = await query({
        query: "SELECT id FROM users WHERE id = ?",
        values: [slug],
      });
      userId = idResult[0]?.id;
    }

    if (!userId) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get complete user profile
    const userProfile = await query({
      query: `
        SELECT 
          u.id, u.name, u.email, u.bio, u.avatar_url, u.website, u.location,
          u.twitter, u.github, u.linkedin, u.user_slug, u.created_at,
          COUNT(DISTINCT uf1.follower_id) as followers_count,
          COUNT(DISTINCT uf2.following_id) as following_count,
          COUNT(DISTINCT a.id) as articles_count,
          COALESCE(SUM(av.view_count), 0) as total_views
        FROM users u
        LEFT JOIN user_follows uf1 ON uf1.following_id = u.id
        LEFT JOIN user_follows uf2 ON uf2.follower_id = u.id
        LEFT JOIN articles a ON a.author_id = u.id AND a.status = 'published'
        LEFT JOIN article_views av ON av.article_id = a.id
        WHERE u.id = ?
        GROUP BY u.id
      `,
      values: [userId],
    });

    if (!userProfile[0]) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = userProfile[0];

    // Get recent articles by this user
    const articles = await query({
      query: `
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.featured_image,
          a.published_at,
          COUNT(DISTINCT av.id) as views
        FROM articles a
        LEFT JOIN article_views av ON av.article_id = a.id
        WHERE a.author_id = ? AND a.status = 'published'
        GROUP BY a.id
        ORDER BY a.published_at DESC
        LIMIT 10
      `,
      values: [userId],
    });

    return NextResponse.json({
      user: {
        ...user,
        articles,
      },
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return NextResponse.json(
      { message: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
