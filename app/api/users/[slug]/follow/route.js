import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function resolveUserId(slug) {
  // Try by numeric ID first
  if (!isNaN(slug)) {
    const result = await query({
      query: "SELECT id FROM users WHERE id = ?",
      values: [parseInt(slug)],
    });
    if (result.length > 0) {
      return result[0].id;
    }
  }

  // Try by username
  let result = await query({
    query: "SELECT id FROM users WHERE username = ?",
    values: [slug],
  });
  if (result.length > 0) {
    return result[0].id;
  }

  // Try by user_slug
  result = await query({
    query: "SELECT id FROM users WHERE user_slug = ?",
    values: [slug],
  });
  if (result.length > 0) {
    return result[0].id;
  }

  return null;
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const followingId = await resolveUserId(slug);

    if (!followingId) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get current user ID
    const currentUser = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (!currentUser[0]) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const followerId = currentUser[0].id;

    // Prevent self-following
    if (followerId === followingId) {
      return NextResponse.json(
        { message: "Cannot follow yourself" },
        { status: 400 },
      );
    }

    // Insert or update follow relationship
    await query({
      query: `
        INSERT INTO user_follows (follower_id, following_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE created_at = NOW()
      `,
      values: [followerId, followingId],
    });

    return NextResponse.json({ message: "Followed successfully" });
  } catch (err) {
    console.error("Error following user:", err);
    return NextResponse.json(
      { message: "Failed to follow user" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const followingId = await resolveUserId(slug);

    if (!followingId) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get current user ID
    const currentUser = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (!currentUser[0]) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const followerId = currentUser[0].id;

    // Delete follow relationship
    await query({
      query:
        "DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?",
      values: [followerId, followingId],
    });

    return NextResponse.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error("Error unfollowing user:", err);
    return NextResponse.json(
      { message: "Failed to unfollow user" },
      { status: 500 },
    );
  }
}
