import { query } from "@/lib/db";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://edutechplus.com";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";

    let sql = "";
    let sitemap = "";

    // XML header
    sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

    if (type === "articles" || type === "all") {
      const articles = await query(
        `SELECT a.id, a.slug, a.title, a.featured_image, a.updated_at, a.created_at, MIN(c.slug) AS category_slug
         FROM articles a
         LEFT JOIN article_categories ac ON ac.article_id = a.id
         LEFT JOIN categories c ON c.id = COALESCE(ac.category_id, a.category_id)
         WHERE a.status = 'published' AND a.created_by_role = 'user'
         GROUP BY a.id
         ORDER BY a.updated_at DESC
         LIMIT 50000`,
      );

      if (articles && Array.isArray(articles)) {
        articles
          .filter((article) => article.category_slug)
          .forEach((article) => {
            const path = `/${article.category_slug}/${article.slug}`;
            const loc = `${BASE_URL}${path}`;
            const lastmod = article.updated_at
              ? new Date(article.updated_at).toISOString().split("T")[0]
              : new Date(article.created_at).toISOString().split("T")[0];

            sitemap += `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;

            if (article.featured_image) {
              sitemap += `
    <image:image>
      <image:loc>${escapeXml(article.featured_image)}</image:loc>
      <image:title>${escapeXml(article.title)}</image:title>
    </image:image>`;
            }

            sitemap += `
  </url>
`;
          });
      }
    }

    if (type === "categories" || type === "all") {
      const categories = await query(
        `SELECT id, slug, name, updated_at FROM categories 
         WHERE parent_id IS NULL 
         ORDER BY id DESC 
         LIMIT 10000`,
      );

      if (categories && Array.isArray(categories)) {
        categories.forEach((category) => {
          const loc = `${BASE_URL}/categories/${category.slug}`;
          const lastmod = category.updated_at
            ? new Date(category.updated_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];

          sitemap += `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>
`;
        });
      }
    }

    sitemap += `</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
      {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
        status: 500,
      },
    );
  }
}

function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
