import { query } from "@/lib/db";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://articlegrip.com";

function escapeXml(value) {
  if (!value) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const articles = await query(
      "SELECT a.title, a.slug, a.excerpt, a.published_at, a.updated_at, MIN(c.slug) AS category_slug FROM articles a LEFT JOIN article_categories ac ON ac.article_id = a.id LEFT JOIN categories c ON c.id = COALESCE(ac.category_id, a.category_id) WHERE a.status = 'published' GROUP BY a.id ORDER BY a.published_at DESC LIMIT 50",
    );

    const now = new Date().toUTCString();
    const itemsXml = (articles || [])
      .filter((article) => article.category_slug)
      .map((article) => {
        const link = `${BASE_URL}/${article.category_slug}/${article.slug}`;
        const pubDate = new Date(
          article.published_at || article.updated_at || Date.now(),
        ).toUTCString();
        return `
  <item>
    <title>${escapeXml(article.title)}</title>
    <link>${escapeXml(link)}</link>
    <guid isPermaLink="true">${escapeXml(link)}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${escapeXml(article.excerpt || "")}</description>
  </item>`;
      })
      .join("");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Edu Tech Pluse</title>
  <link>${BASE_URL}</link>
  <description>Latest articles and insights from Edu Tech Pluse.</description>
  <language>en-us</language>
  <lastBuildDate>${now}</lastBuildDate>${itemsXml}
</channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("RSS generation error:", error);
    return new NextResponse("", { status: 500 });
  }
}
