import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    const followerIdParam = req.nextUrl.searchParams.get("follower_id");

    if (!followerIdParam) {
      return NextResponse.json(
        { message: "follower_id query parameter is required" },
        { status: 400 },
      );
    }

    // Resolve user ID from slug (username, user_slug, or ID)
    let userId = null;

    // Try by username first
    let result = await query({
      query: "SELECT id FROM users WHERE username = ?",
      values: [slug],
    });

    if (result.length > 0) {
      userId = result[0].id;
    }

    // Try by user_slug if not found
    if (!userId) {
      result = await query({
        query: "SELECT id FROM users WHERE user_slug = ?",
        values: [slug],
      });
      if (result.length > 0) {
        userId = result[0].id;
      }
    }

    // Try by ID as last resort
    if (!userId && !isNaN(slug)) {
      result = await query({
        query: "SELECT id FROM users WHERE id = ?",
        values: [parseInt(slug)],
      });
      if (result.length > 0) {
        userId = result[0].id;
      }
    }

    if (!userId) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const followerId = parseInt(followerIdParam);

    if (isNaN(followerId)) {
      return NextResponse.json(
        { message: "Invalid follower_id parameter" },
        { status: 400 },
      );
    }

    // Check if the follower is following the user
    const followRelation = await query({
      query:
        "SELECT id FROM user_follows WHERE follower_id = ? AND following_id = ?",
      values: [followerId, userId],
    });

    return NextResponse.json({
      isFollowing: followRelation.length > 0,
    });
  } catch (err) {
    console.error("Error checking follow status:", err);
    return NextResponse.json(
      { message: "Failed to check follow status" },
      { status: 500 },
    );
  }
}
