import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const limit = Math.min(parseInt(searchParams.get("limit")) || 20, 100);
    const offset = parseInt(searchParams.get("offset")) || 0;

    if (!slug) {
      return NextResponse.json(
        { error: "Tag slug is required" },
        { status: 400 },
      );
    }

    // Get tag by slug
    const tags = await query({
      query: "SELECT id, name, slug, description FROM tags WHERE slug = ?",
      values: [slug],
    });

    if (tags.length === 0) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const tag = tags[0];

    // Try to get articles with this tag - handle missing article_tags table
    try {
      // Get articles with this tag
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
          LEFT JOIN article_tags at ON at.article_id = a.id
          LEFT JOIN tags t ON t.id = at.tag_id
          LEFT JOIN article_views av ON av.article_id = a.id
          WHERE a.status = 'published' AND a.created_by_role = 'user' AND t.slug = ?
          GROUP BY a.id
          ORDER BY a.published_at DESC
          LIMIT ? OFFSET ?
        `,
        values: [slug, limit, offset],
      });

      // Get total count
      const countResult = await query({
        query: `
          SELECT COUNT(DISTINCT a.id) as total
          FROM articles a
          LEFT JOIN article_tags at ON at.article_id = a.id
          LEFT JOIN tags t ON t.id = at.tag_id
          WHERE a.status = 'published' AND a.created_by_role = 'user' AND t.slug = ?
        `,
        values: [slug],
      });

      const total = countResult[0]?.total || 0;

      // Transform articles to include categories as array
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
        tag,
        articles: transformedArticles,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      });
    } catch (tableErr) {
      // article_tags table doesn't exist - return empty results
      if (tableErr.code === "ER_NO_SUCH_TABLE") {
        return NextResponse.json({
          tag,
          articles: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false,
          },
        });
      }
      throw tableErr;
    }
  } catch (err) {
    console.error("Error fetching articles by tag:", err);
    return NextResponse.json(
      { error: "Failed to fetch articles by tag" },
      { status: 500 },
    );
  }
}
