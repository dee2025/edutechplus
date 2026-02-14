import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    // Get user profile
    const users = await query({
      query: `
        SELECT 
          u.id, u.name, u.email, u.bio, u.avatar_url, u.website,
          u.location, u.twitter, u.github, u.linkedin,
          u.created_at,
          COUNT(DISTINCT uf.follower_id) as followers_count,
          COUNT(DISTINCT ufo.following_id) as following_count,
          COUNT(DISTINCT a.id) as articles_count
        FROM users u
        LEFT JOIN user_follows uf ON uf.following_id = u.id
        LEFT JOIN user_follows ufo ON ufo.follower_id = u.id
        LEFT JOIN articles a ON a.author_id = u.id AND a.status = 'published'
        WHERE u.id = ?
        GROUP BY u.id
      `,
      values: [id],
    });

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Get user's latest articles
    const articles = await query({
      query: `
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.featured_image,
          COUNT(DISTINCT av.id) as views,
          a.published_at
        FROM articles a
        LEFT JOIN article_views av ON av.article_id = a.id
        WHERE a.author_id = ? AND a.status = 'published'
        GROUP BY a.id
        ORDER BY a.published_at DESC
        LIMIT 10
      `,
      values: [id],
    });

    return NextResponse.json({
      user,
      articles,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
