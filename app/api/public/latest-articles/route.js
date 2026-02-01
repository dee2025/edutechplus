import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const categorySlug = searchParams.get("category");

    const offset = (page - 1) * limit;

    let whereClause = `WHERE a.status = 'published'`;
    let params = [];

    // category filter
    if (categorySlug) {
      whereClause += ` AND c.slug = ?`;
      params.push(categorySlug);
    }

    // total count
    const [[countRow]] = await pool.execute(
      `
            SELECT COUNT(*) as total
            FROM articles a
            LEFT JOIN categories c ON c.id = a.category_id
            ${whereClause}
            `,
      params,
    );

    // articles
    const [articles] = await pool.execute(
      `
            SELECT
                a.id,
                a.title,
                a.slug,
                a.excerpt,
                a.featured_image,
                a.read_time,
                a.published_at,
                ad.name AS author_name,
                c.name AS category_name,
                c.slug AS category_slug
            FROM articles a
            JOIN admins ad ON ad.id = a.author_id
            LEFT JOIN categories c ON c.id = a.category_id
            ${whereClause}
            ORDER BY a.published_at DESC
            LIMIT ? OFFSET ?
            `,
      [...params, limit, offset],
    );

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total: countRow.total,
        totalPages: Math.ceil(countRow.total / limit),
      },
    });
  } catch (error) {
    console.error("Latest Articles API Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch articles" },
      { status: 500 },
    );
  }
}
