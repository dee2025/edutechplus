import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get("limit")) || 20,
      100,
    );

    // Get current user ID
    const users = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    // Get articles from users that the current user follows (excluding own articles)
    const articles = await query({
      query: `
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.featured_image, a.content,
          a.author_id, u.name as author_name, 
          IFNULL(u.username, u.user_slug) as author_username, 
          u.user_slug as author_slug,
          c.id as category_id, c.name as category_name, c.slug as category_slug,
          COUNT(DISTINCT av.id) as views,
          COUNT(DISTINCT al.user_id) as likes_count,
          COUNT(DISTINCT cm.id) as comments_count,
          a.published_at, a.created_at
        FROM articles a
        INNER JOIN user_follows uf ON uf.following_id = a.author_id
        LEFT JOIN users u ON u.id = a.author_id
        LEFT JOIN article_categories ac ON ac.article_id = a.id
        LEFT JOIN categories c ON c.id = ac.category_id
        LEFT JOIN article_views av ON av.article_id = a.id
        LEFT JOIN article_likes al ON al.article_id = a.id
        LEFT JOIN comments cm ON cm.article_id = a.id AND cm.is_deleted = 0 AND cm.is_approved = 1
        WHERE uf.follower_id = ? 
          AND a.author_id != ?
          AND a.status = 'published' 
          AND a.created_by_role = 'user'
        GROUP BY a.id
        ORDER BY a.published_at DESC
        LIMIT ?
      `,
      values: [userId, userId, limit],
    });

    // Transform to include categories as array
    const transformedArticles = articles.reduce((acc, article) => {
      const existing = acc.find((a) => a.id === article.id);
      if (existing) {
        if (
          article.category_id &&
          !existing.categories.find((c) => c.id === article.category_id)
        ) {
          existing.categories.push({
            id: article.category_id,
            name: article.category_name,
            slug: article.category_slug,
          });
        }
      } else {
        acc.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          featured_image: article.featured_image,
          content: article.content,
          author_id: article.author_id,
          author_name: article.author_name,
          author_username: article.author_username,
          author_slug: article.author_slug,
          views: article.views,
          likes_count: article.likes_count,
          comments_count: article.comments_count,
          published_at: article.published_at,
          created_at: article.created_at,
          categories: article.category_id
            ? [
                {
                  id: article.category_id,
                  name: article.category_name,
                  slug: article.category_slug,
                },
              ]
            : [],
        });
      }
      return acc;
    }, []);

    return NextResponse.json({
      articles: transformedArticles,
      total: transformedArticles.length,
    });
  } catch (error) {
    console.error("Error fetching following articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles from following" },
      { status: 500 },
    );
  }
}
