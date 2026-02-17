import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const normalizeSlug = (slug) =>
  (slug || "").replace(/^\/?(articles|article)\//, "");

export async function GET(req) {
  try {
    const session = await getServerSession();
    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get("limit")) || 8,
      100,
    );

    let userId = null;
    if (session?.user?.email) {
      const users = await query({
        query: "SELECT id FROM users WHERE email = ?",
        values: [session.user.email],
      });
      if (users.length > 0) {
        userId = users[0].id;
      }
    }

    // Exclude user's own articles if authenticated
    const whereClause = userId
      ? "WHERE a.status = 'published' AND a.created_by_role = 'user' AND a.author_id != ?"
      : "WHERE a.status = 'published' AND a.created_by_role = 'user'";

    const articles = await query({
      query: `
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.featured_image,
          a.author_id, u.name as author_name, IFNULL(u.username, u.user_slug) as author_username, u.user_slug as author_slug,
          c.id as category_id, c.name as category_name, c.slug as category_slug,
          COUNT(DISTINCT av.id) as views,
          COUNT(DISTINCT cm.id) as comments_count,
          a.published_at
        FROM articles a
        LEFT JOIN users u ON u.id = a.author_id
        LEFT JOIN article_categories ac ON ac.article_id = a.id
        LEFT JOIN categories c ON c.id = ac.category_id
        LEFT JOIN article_views av ON av.article_id = a.id
        LEFT JOIN comments cm ON cm.article_id = a.id AND cm.is_deleted = 0 AND cm.is_approved = 1
        ${whereClause}
        GROUP BY a.id
        ORDER BY views DESC, a.published_at DESC
        LIMIT ?
      `,
      values: userId ? [userId, limit] : [limit],
    });

    const normalized = articles.map((article) => ({
      ...article,
      slug: normalizeSlug(article.slug),
    }));
    return NextResponse.json({ articles: normalized });
  } catch (err) {
    console.error("Error fetching trending articles:", err);
    return NextResponse.json(
      { error: "Failed to fetch trending articles" },
      { status: 500 },
    );
  }
}
