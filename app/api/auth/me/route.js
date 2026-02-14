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

    // Fetch full user data from database using email
    const users = await query({
      query:
        "SELECT id, name, email, avatar_url, created_at FROM users WHERE email = ?",
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
