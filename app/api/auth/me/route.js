import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Use NextAuth to get the session
    const session = await getServerSession();

    if (!session?.user?.email && !session?.user?.id) {
      return NextResponse.json(null);
    }

    const userId = session?.user?.id ? Number(session.user.id) : null;

    // Fetch full user data with light-weight correlated counts (less expensive than multi-join DISTINCT aggregation)
    const users = await query({
      query: `
        SELECT 
          u.id, u.name, u.email, u.avatar_url, u.bio, u.username, u.user_slug,
          u.provider, u.provider_id, u.email_verified, u.created_at,
          (
            SELECT COUNT(*)
            FROM user_follows uf1
            WHERE uf1.following_id = u.id
          ) as followers_count,
          (
            SELECT COUNT(*)
            FROM user_follows uf2
            WHERE uf2.follower_id = u.id
          ) as following_count,
          (
            SELECT COUNT(*)
            FROM articles a
            WHERE a.author_id = u.id
              AND a.status = 'published'
              AND a.created_by_role = 'user'
          ) as articles_count
        FROM users u
        WHERE ${userId ? "u.id = ?" : "u.email = ?"}
        LIMIT 1
      `,
      values: [userId || session.user.email],
    });

    if (users.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(users[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    return NextResponse.json(null);
  }
}
