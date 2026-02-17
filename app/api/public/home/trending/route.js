import pool from "@/lib/db";
import { NextResponse } from "next/server";

const normalizeSlug = (slug) =>
  (slug || "").replace(/^\/?(articles|article)\//, "");

const DEFAULT_LAYOUT = {
  sections: {
    hero_main: { items: [] },
    hero_side: { items: [] },
    featured: { items: [] },
    latest: { auto: true, count: 6 },
  },
};

function parseLayout(row) {
  if (!row?.config_json) return DEFAULT_LAYOUT;
  if (typeof row.config_json === "string") {
    try {
      return JSON.parse(row.config_json);
    } catch (e) {
      return DEFAULT_LAYOUT;
    }
  }
  return row.config_json;
}

async function getHomepageLayout() {
  const [rows] = await pool.execute(
    "SELECT config_json FROM homepage_layout WHERE layout_key = 'homepage' LIMIT 1",
  );
  if (!rows.length) return DEFAULT_LAYOUT;
  return parseLayout(rows[0]);
}

export async function GET() {
  const layout = await getHomepageLayout();
  const limit = Number(layout.sections?.latest?.count) || 6;

  const [rows] = await pool.execute(
    `
                SELECT
                        a.id,
                        a.title,
                        a.slug,
                        a.excerpt,
                        a.featured_image,
                        u.name as author_name,
                        IFNULL(u.username, u.user_slug) as author_username,
                        u.user_slug as author_slug,
                  MIN(c.name) AS category_name,
                  MIN(c.slug) AS category_slug
                FROM articles a
                LEFT JOIN users u ON u.id = a.author_id
                LEFT JOIN article_categories ac ON ac.article_id = a.id
                LEFT JOIN categories c ON c.id = COALESCE(ac.category_id, a.category_id)
                WHERE a.status = 'published' AND a.created_by_role = 'user'
                GROUP BY a.id
                ORDER BY a.published_at DESC
                LIMIT ?
        `,
    [limit],
  );

  const normalized = rows.map((row) => ({
    ...row,
    slug: normalizeSlug(row.slug),
  }));
  return NextResponse.json(normalized);
}
