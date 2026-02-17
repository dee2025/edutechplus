import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

/**
 * GET: Get single tag
 */
export async function GET(req, { params }) {
  const param = await params;
  const id = param.id;

  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    const [tags] = await pool.execute(
      `SELECT 
        t.id,
        t.name,
        t.slug,
        t.description,
        t.color,
        t.created_at,
        COUNT(DISTINCT at.article_id) as article_count
      FROM tags t
      LEFT JOIN article_tags at ON at.tag_id = t.id
      WHERE t.id = ?
      GROUP BY t.id`,
      [id],
    );

    if (tags.length === 0) {
      return NextResponse.json({ message: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json(tags[0]);
  } catch (err) {
    console.error("Error fetching tag:", err);
    return NextResponse.json(
      { message: "Failed to fetch tag" },
      { status: 500 },
    );
  }
}

/**
 * PUT: Update tag
 */
export async function PUT(req, { params }) {
  const param = await params;
  const id = param.id;

  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Only super_admin can update tags
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

    // Check if another tag has the same name or slug
    const [existing] = await pool.execute(
      "SELECT id FROM tags WHERE (name = ? OR slug = ?) AND id != ?",
      [name, slug, id],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Another tag with this name or slug already exists" },
        { status: 400 },
      );
    }

    await pool.execute(
      `UPDATE tags SET name = ?, slug = ?, description = ?, color = ? WHERE id = ?`,
      [name, slug, description || null, color || "#06B6D4", id],
    );

    return NextResponse.json({ message: "Tag updated successfully" });
  } catch (err) {
    console.error("Error updating tag:", err);
    return NextResponse.json(
      { message: "Failed to update tag" },
      { status: 500 },
    );
  }
}

/**
 * DELETE: Delete tag
 */
export async function DELETE(req, { params }) {
  const param = await params;
  const id = param.id;

  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Only super_admin can delete tags
    if (decoded.role !== "super_admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Check if tag is being used
    const [usage] = await pool.execute(
      "SELECT COUNT(*) as count FROM article_tags WHERE tag_id = ?",
      [id],
    );

    if (usage[0].count > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete tag. It is used by ${usage[0].count} article(s)`,
        },
        { status: 400 },
      );
    }

    await pool.execute("DELETE FROM tags WHERE id = ?", [id]);

    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (err) {
    console.error("Error deleting tag:", err);
    return NextResponse.json(
      { message: "Failed to delete tag" },
      { status: 500 },
    );
  }
}
