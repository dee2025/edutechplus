import { query } from "@/lib/db";
import { NextResponse } from "next/server";

const normalizeSlug = (slug) =>
  (slug || "").replace(/^\/?(articles|article)\//, "");

export async function GET(req) {
  try {
    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get("limit")) || 10,
      50,
    );
    const days = parseInt(req.nextUrl.searchParams.get("days")) || 7; // Last 7 days by default

    // Get most viewed articles in the last N days
    const articles = await query({
      query: `
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.featured_image,
          a.author_id, u.name as author_name, IFNULL(u.username, u.user_slug) as author_username, u.user_slug as author_slug,
          COUNT(DISTINCT av.id) as views,
          a.published_at
        FROM articles a
        LEFT JOIN users u ON u.id = a.author_id
        LEFT JOIN article_views av ON av.article_id = a.id 
          AND av.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        WHERE a.status = 'published' AND a.created_by_role = 'user'
        GROUP BY a.id
        HAVING views > 0
        ORDER BY views DESC
        LIMIT ?
      `,
      values: [days, limit],
    });

    const normalized = articles.map((article) => ({
      ...article,
      slug: normalizeSlug(article.slug),
    }));
    return NextResponse.json({ articles: normalized });
  } catch (err) {
    console.error("Error fetching most viewed articles:", err);
    return NextResponse.json(
      { error: "Failed to fetch most viewed articles" },
      { status: 500 },
    );
  }
}
