import { verifyToken } from "@/lib/auth";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    const userId = payload.id;

    const { name, avatar_url } = await req.json();

    if (!name && !avatar_url) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 },
      );
    }

    // Sanitize name safely. Use dynamic import to avoid server/runtime mismatch and
    // fall back to a simple tag-stripping if the sanitizer isn't available.
    let cleanName = null;
    if (name) {
      try {
        const DOMPurify = (await import("isomorphic-dompurify")).default;
        if (DOMPurify && typeof DOMPurify.sanitize === "function") {
          // For a simple name field we strip all tags
          cleanName = DOMPurify.sanitize(name, { ALLOWED_TAGS: [] })
            .trim()
            .slice(0, 255);
        } else {
          cleanName = name
            .replace(/<[^>]*>?/gm, "")
            .trim()
            .slice(0, 255);
        }
      } catch (e) {
        cleanName = name
          .replace(/<[^>]*>?/gm, "")
          .trim()
          .slice(0, 255);
      }
    }

    const cleanAvatar = avatar_url ? avatar_url.trim().slice(0, 512) : null;

    // Basic URL validation for avatar
    if (cleanAvatar && !/^https?:\/\/.+/i.test(cleanAvatar)) {
      return NextResponse.json(
        { message: "avatar_url must be a valid URL" },
        { status: 400 },
      );
    }

    const updates = [];
    const params = [];
    if (cleanName !== null) {
      updates.push("name = ?");
      params.push(cleanName);
    }
    if (cleanAvatar !== null) {
      updates.push("avatar_url = ?");
      params.push(cleanAvatar);
    }

    params.push(userId);

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    await pool.query(sql, params);

    const [rows] = await pool.query(
      "SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?",
      [userId],
    );

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json(null);

    const payload = await verifyToken(token);
    const userId = payload.id;

    const [rows] = await pool.query(
      "SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?",
      [userId],
    );

    if (!rows.length) return NextResponse.json(null);

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json(null);
  }
}
