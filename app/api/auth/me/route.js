import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Use NextAuth to get the session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(null);
    }

    // Fetch full user data from database using email with follower/article counts
    const users = await query({
      query: `
        SELECT 
          u.id, u.name, u.email, u.avatar_url, u.bio, u.username, u.user_slug,
          u.provider, u.provider_id, u.email_verified, u.created_at,
          COUNT(DISTINCT uf1.follower_id) as followers_count,
          COUNT(DISTINCT uf2.following_id) as following_count,
          COUNT(DISTINCT a.id) as articles_count
        FROM users u
        LEFT JOIN user_follows uf1 ON uf1.following_id = u.id
        LEFT JOIN user_follows uf2 ON uf2.follower_id = u.id
        LEFT JOIN articles a ON a.author_id = u.id AND a.status = 'published' AND a.created_by_role = 'user'
        WHERE u.email = ?
        GROUP BY u.id
      `,
      values: [session.user.email],
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
