import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Follow a user
export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - please log in" },
        { status: 401 }
      );
    }

    const { id: followingId } = params;

    // Get current user ID
    const users = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const followerId = users[0].id;

    // Cannot follow yourself
    if (parseInt(followingId) === followerId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if user to follow exists
    const followingUser = await query({
      query: "SELECT id FROM users WHERE id = ?",
      values: [followingId],
    });

    if (followingUser.length === 0) {
      return NextResponse.json(
        { error: "User to follow not found" },
        { status: 404 }
      );
    }

    // Add follow relationship
    await query({
      query: `
        INSERT INTO user_follows (follower_id, following_id) 
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE created_at = NOW()
      `,
      values: [followerId, followingId],
    });

    return NextResponse.json({
      success: true,
      message: "User followed successfully",
    });
  } catch (err) {
    console.error("Error following user:", err);
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 }
    );
  }
}

// Unfollow a user
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - please log in" },
        { status: 401 }
      );
    }

    const { id: followingId } = params;

    // Get current user ID
    const users = await query({
      query: "SELECT id FROM users WHERE email = ?",
      values: [session.user.email],
    });

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const followerId = users[0].id;

    // Remove follow relationship
    await query({
      query: "DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?",
      values: [followerId, followingId],
    });

    return NextResponse.json({
      success: true,
      message: "User unfollowed successfully",
    });
  } catch (err) {
    console.error("Error unfollowing user:", err);
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}
