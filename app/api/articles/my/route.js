import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user ID
    const users = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (users.length === 0) {
      return NextResponse.json({ articles: [] });
    }

    const userId = users[0].id;

    // Get user's articles
    const articles = await query({
      query: `
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.featured_image,
          a.status, a.published_at, a.created_at, 
          COUNT(av.id) as views
        FROM articles a
        LEFT JOIN article_views av ON av.article_id = a.id
        WHERE a.author_id = ?
        GROUP BY a.id
        ORDER BY a.created_at DESC
      `,
      values: [userId],
    });

    // Get categories for each article
    const articlesWithCategories = await Promise.all(
      articles.map(async (article) => {
        const categories = await query({
          query: `
            SELECT c.id, c.name, c.slug
            FROM article_categories ac
            JOIN categories c ON c.id = ac.category_id
            WHERE ac.article_id = ?
          `,
          values: [article.id],
        });
        return { ...article, categories };
      })
    );

    return NextResponse.json({ 
      articles: articlesWithCategories,
      total: articlesWithCategories.length 
    });
  } catch (err) {
    console.error("Error fetching user articles:", err);
    return NextResponse.json(
      { message: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
