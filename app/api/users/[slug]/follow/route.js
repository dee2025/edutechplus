import { query } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;
    const followingId = parseInt(slug); // Expecting numeric ID

    if (isNaN(followingId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
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
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await query({
      query: "SELECT id FROM users WHERE id = ?",
      values: [followingId],
    });

    if (!targetUser[0]) {
      return NextResponse.json(
        { message: "Target user not found" },
        { status: 404 }
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
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;
    const followingId = parseInt(slug); // Expecting numeric ID

    if (isNaN(followingId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
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
      query: "DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?",
      values: [followerId, followingId],
    });

    return NextResponse.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error("Error unfollowing user:", err);
    return NextResponse.json(
      { message: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}
