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

    const {
      name,
      avatar_url,
      bio,
      location,
      website,
      twitter,
      github,
      linkedin,
    } = await req.json();

    if (
      !name &&
      !avatar_url &&
      !bio &&
      !location &&
      !website &&
      !twitter &&
      !github &&
      !linkedin
    ) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 },
      );
    }

    // Sanitize inputs
    let cleanName = null;
    if (name) {
      try {
        const DOMPurify = (await import("isomorphic-dompurify")).default;
        if (DOMPurify && typeof DOMPurify.sanitize === "function") {
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
    if (cleanAvatar && !/^https?:\/\/.+/i.test(cleanAvatar)) {
      return NextResponse.json(
        { message: "avatar_url must be a valid URL" },
        { status: 400 },
      );
    }

    const cleanBio = bio ? bio.trim().slice(0, 500) : null;
    const cleanLocation = location ? location.trim().slice(0, 100) : null;
    const cleanWebsite = website ? website.trim().slice(0, 255) : null;

    // Validate website URL if provided
    if (cleanWebsite && !/^https?:\/\/.+/i.test(cleanWebsite)) {
      return NextResponse.json(
        { message: "website must be a valid URL" },
        { status: 400 },
      );
    }

    const cleanTwitter = twitter ? twitter.trim().slice(0, 100) : null;
    const cleanGithub = github ? github.trim().slice(0, 100) : null;
    const cleanLinkedin = linkedin ? linkedin.trim().slice(0, 100) : null;

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
    if (bio !== undefined) {
      updates.push("bio = ?");
      params.push(cleanBio);
    }
    if (location !== undefined) {
      updates.push("location = ?");
      params.push(cleanLocation);
    }
    if (website !== undefined) {
      updates.push("website = ?");
      params.push(cleanWebsite);
    }
    if (twitter !== undefined) {
      updates.push("twitter = ?");
      params.push(cleanTwitter);
    }
    if (github !== undefined) {
      updates.push("github = ?");
      params.push(cleanGithub);
    }
    if (linkedin !== undefined) {
      updates.push("linkedin = ?");
      params.push(cleanLinkedin);
    }

    params.push(userId);

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    await query({ query: sql, values: params });

    // Return full user data
    const updatedUsers = await query({
      query: `
        SELECT 
          u.id, u.name, u.email, u.avatar_url, u.bio, u.website, u.location,
          u.twitter, u.github, u.linkedin,
          IFNULL(u.username, u.user_slug) as username,
          u.user_slug, u.provider, u.provider_id, u.email_verified, u.created_at,
          COUNT(DISTINCT uf1.follower_id) as followers_count,
          COUNT(DISTINCT uf2.following_id) as following_count,
          COUNT(DISTINCT a.id) as articles_count
        FROM users u
        LEFT JOIN user_follows uf1 ON uf1.following_id = u.id
        LEFT JOIN user_follows uf2 ON uf2.follower_id = u.id
        LEFT JOIN articles a ON a.author_id = u.id AND a.status = 'published' AND a.created_by_role = 'user'
        WHERE u.id = ?
        GROUP BY u.id
      `,
      values: [userId],
    });

    return NextResponse.json({ user: updatedUsers[0] });
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
