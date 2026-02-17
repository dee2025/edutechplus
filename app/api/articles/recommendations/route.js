import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const normalizeSlug = (slug) =>
  (slug || "").replace(/^\/?(articles|article)\//, "");

export async function GET(req) {
  try {
    const session = await getServerSession();
    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get("limit")) || 20,
      100,
    );

    let articles = [];

    if (session?.user?.email) {
      // Authenticated user - personalized feed
      const users = await query({
        query: "SELECT id FROM users WHERE email = ?",
        values: [session.user.email],
      });

      if (users.length > 0) {
        const userId = users[0].id;

        // Get user's interested categories
        const userInterests = await query({
          query: `
            SELECT category_id, interest_score
            FROM user_interests
            WHERE user_id = ?
            ORDER BY interest_score DESC
            LIMIT 10
          `,
          values: [userId],
        });

        if (userInterests.length > 0) {
          const categoryIds = userInterests.map((i) => i.category_id);
          const placeholders = categoryIds.map(() => "?").join(",");

          // Get articles from interested categories with views
          articles = await query({
            query: `
              SELECT 
                a.id, a.title, a.slug, a.excerpt, a.featured_image,
                a.author_id, u.name as author_name, IFNULL(u.username, u.user_slug) as author_username, u.user_slug as author_slug,
                c.id as category_id, c.name as category_name, c.slug as category_slug,
                COUNT(av.id) as views,
                a.published_at, a.created_at
              FROM articles a
              LEFT JOIN users u ON u.id = a.author_id
              LEFT JOIN article_categories ac ON ac.article_id = a.id
              LEFT JOIN categories c ON c.id = ac.category_id
              LEFT JOIN article_views av ON av.article_id = a.id
              WHERE a.status = 'published' 
                AND a.author_id != ?
                AND c.id IN (${placeholders})
              GROUP BY a.id
              ORDER BY a.published_at DESC, views DESC
              LIMIT ?
            `,
            values: [...categoryIds, userId, limit],
          });
        }
      }
    }

    // If no recommendations (non-auth or no interests), get trending articles
    if (articles.length === 0) {
      articles = await query({
        query: `
          SELECT 
            a.id, a.title, a.slug, a.excerpt, a.featured_image,
            a.author_id, u.name as author_name, IFNULL(u.username, u.user_slug) as author_username, u.user_slug as author_slug,
            c.id as category_id, c.name as category_name, c.slug as category_slug,
            COUNT(av.id) as views,
            a.published_at, a.created_at
          FROM articles a
          LEFT JOIN users u ON u.id = a.author_id
          LEFT JOIN article_categories ac ON ac.article_id = a.id
          LEFT JOIN categories c ON c.id = ac.category_id
          LEFT JOIN article_views av ON av.article_id = a.id
          WHERE a.status = 'published'
          GROUP BY a.id
          ORDER BY views DESC, a.published_at DESC
          LIMIT ?
        `,
        values: [limit],
      });
    }

    // Group by article ID to avoid duplicates
    const articleMap = new Map();
    for (const article of articles) {
      if (!articleMap.has(article.id)) {
        articleMap.set(article.id, {
          id: article.id,
          title: article.title,
          slug: normalizeSlug(article.slug),
          excerpt: article.excerpt,
          featured_image: article.featured_image,
          author_id: article.author_id,
          author_name: article.author_name,
          author_slug: article.author_slug,
          views: article.views || 0,
          published_at: article.published_at,
          created_at: article.created_at,
          categories: [],
        });
      }

      if (article.category_id) {
        const existing = articleMap.get(article.id);
        if (!existing.categories.find((c) => c.id === article.category_id)) {
          existing.categories.push({
            id: article.category_id,
            name: article.category_name,
            slug: article.category_slug,
          });
        }
      }
    }

    return NextResponse.json({
      articles: Array.from(articleMap.values()).slice(0, limit),
      total: articleMap.size,
    });
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    return NextResponse.json(
      { message: "Failed to fetch recommendations", articles: [] },
      { status: 200 }, // Return 200 even on error to not break frontend
    );
  }
}
