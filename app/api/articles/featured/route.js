import { query } from "@/lib/db";
import { NextResponse } from "next/server";

const normalizeSlug = (slug) =>
  (slug || "").replace(/^\/?(articles|article)\//, "");

export async function GET(req) {
  try {
    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get("limit")) || 5,
      20,
    );

    // Get featured articles - recently published with good view counts
    const articles = await query({
      query: `
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.featured_image, a.content,
          a.author_id, u.name as author_name, IFNULL(u.username, u.user_slug) as author_username, u.user_slug as author_slug,
          c.id as category_id, c.name as category_name, c.slug as category_slug,
          COUNT(DISTINCT av.id) as views,
          a.published_at, a.created_at
        FROM articles a
        LEFT JOIN users u ON u.id = a.author_id
        LEFT JOIN article_categories ac ON ac.article_id = a.id
        LEFT JOIN categories c ON c.id = ac.category_id
        LEFT JOIN article_views av ON av.article_id = a.id
        WHERE a.status = 'published' AND a.created_by_role = 'user'
        GROUP BY a.id
        ORDER BY a.published_at DESC
        LIMIT ?
      `,
      values: [limit],
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
          ...article,
          slug: normalizeSlug(article.slug),
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

    return NextResponse.json({ articles: transformedArticles });
  } catch (err) {
    console.error("Error fetching featured articles:", err);
    return NextResponse.json(
      { error: "Failed to fetch featured articles" },
      { status: 500 },
    );
  }
}
