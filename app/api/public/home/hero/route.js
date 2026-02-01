import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
//   await pool.end();
  const [rows] = await pool.execute(`
        SELECT
            a.id,
            a.title,
            a.slug,
            a.excerpt,
            a.featured_image,
            c.name AS category_name
        FROM articles a
        JOIN article_flags af ON af.article_id = a.id
        LEFT JOIN categories c ON c.id = a.category_id
        WHERE
            af.is_editors_pick = 1
            AND a.status = 'published'
        ORDER BY
            af.featured_order ASC,
            a.published_at DESC
        LIMIT 5
    `);

  return NextResponse.json(rows);
}
