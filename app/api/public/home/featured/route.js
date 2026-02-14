import pool from "@/lib/db";
import { NextResponse } from "next/server";

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

async function fetchArticlesByIds(ids) {
  if (!ids.length) return [];
  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await pool.execute(
    `
        SELECT
            a.id,
            a.title,
            a.slug,
            a.excerpt,
            a.featured_image,
          MIN(c.name) AS category_name,
          MIN(c.slug) AS category_slug
        FROM articles a
        LEFT JOIN article_categories ac ON ac.article_id = a.id
        LEFT JOIN categories c ON c.id = COALESCE(ac.category_id, a.category_id)
        WHERE a.status = 'published' AND a.id IN (${placeholders})
        GROUP BY a.id
        ORDER BY FIELD(a.id, ${placeholders})
    `,
    [...ids, ...ids],
  );
  return rows;
}

export async function GET() {
  const layout = await getHomepageLayout();
  const ids = (layout.sections?.featured?.items || []).filter(Boolean);
  const rows = await fetchArticlesByIds(ids);
  return NextResponse.json(rows[0] || null);
}
