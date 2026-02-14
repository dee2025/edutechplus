import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    // Use NextAuth to get the session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from database using email
    const users = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

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
    await query({ query: sql, values: params });

    const updatedUsers = await query({
      query:
        "SELECT id, name, email, avatar_url, provider, provider_id, email_verified, created_at FROM users WHERE id = ?",
      values: [userId],
    });

    return NextResponse.json(updatedUsers[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    // Use NextAuth to get the session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(null);
    }

    const users = await query({
      query:
        "SELECT id, name, email, avatar_url, provider, provider_id, email_verified, created_at FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (users.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(users[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json(null);
  }
}
