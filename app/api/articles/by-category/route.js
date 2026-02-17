import { query } from "@/lib/db";
import { NextResponse } from "next/server";

const normalizeSlug = (slug) =>
  (slug || "").replace(/^\/?(articles|article)\//, "");

export async function GET(req) {
  try {
    // Get all categories with their articles
    const categories = await query({
      query: `
        SELECT DISTINCT c.id, c.name, c.slug, c.description
        FROM categories c
        WHERE c.active = 1
        ORDER BY c.name ASC
      `,
      values: [],
    });

    // For each category, get top 3 articles
    const categoriesWithArticles = await Promise.all(
      categories.map(async (category) => {
        const articles = await query({
          query: `
            SELECT 
              a.id, a.title, a.slug, a.excerpt, a.featured_image,
              a.author_id, u.name as author_name, IFNULL(u.username, u.user_slug) as author_username, u.user_slug as author_slug,
              COUNT(av.id) as views,
              a.published_at
            FROM articles a
            LEFT JOIN users u ON u.id = a.author_id
            LEFT JOIN article_categories ac ON ac.article_id = a.id
            LEFT JOIN article_views av ON av.article_id = a.id
            WHERE a.status = 'published' AND a.created_by_role = 'user'
              AND ac.category_id = ?
            GROUP BY a.id
            ORDER BY a.published_at DESC
            LIMIT 3
          `,
          values: [category.id],
        });

        return {
          ...category,
          articles: articles.map((article) => ({
            ...article,
            slug: normalizeSlug(article.slug),
          })),
        };
      }),
    );

    // Filter out categories with no articles
    const filteredCategories = categoriesWithArticles.filter(
      (c) => c.articles.length > 0,
    );

    return NextResponse.json({ categories: filteredCategories });
  } catch (err) {
    console.error("Error fetching articles by category:", err);
    return NextResponse.json(
      { error: "Failed to fetch articles by category" },
      { status: 500 },
    );
  }
}
