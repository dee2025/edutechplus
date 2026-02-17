import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

/**
 * GET: List all tags
 */
export async function GET(req) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    const [tags] = await pool.execute(`
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.description,
        t.color,
        t.created_at,
        COUNT(DISTINCT at.article_id) as article_count
      FROM tags t
      LEFT JOIN article_tags at ON at.tag_id = t.id
      LEFT JOIN articles a ON a.id = at.article_id AND a.status = 'published'
      GROUP BY t.id
      ORDER BY t.name ASC
    `);

    return NextResponse.json(tags);
  } catch (err) {
    console.error("Error fetching tags:", err);
    return NextResponse.json(
      { message: "Failed to fetch tags" },
      { status: 500 },
    );
  }
}

/**
 * POST: Create new tag
 */
export async function POST(req) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Only super_admin can create tags
    if (decoded.role !== "super_admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, slug, description, color } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { message: "Name and slug are required" },
        { status: 400 },
      );
    }

    // Check if tag with same name or slug already exists
    const [existing] = await pool.execute(
      "SELECT id FROM tags WHERE name = ? OR slug = ?",
      [name, slug],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Tag with this name or slug already exists" },
        { status: 400 },
      );
    }

    const [result] = await pool.execute(
      `INSERT INTO tags (name, slug, description, color) VALUES (?, ?, ?, ?)`,
      [name, slug, description || null, color || "#06B6D4"],
    );

    return NextResponse.json({
      message: "Tag created successfully",
      tag_id: result.insertId,
    });
  } catch (err) {
    console.error("Error creating tag:", err);
    return NextResponse.json(
      { message: "Failed to create tag" },
      { status: 500 },
    );
  }
}
