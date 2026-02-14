import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Build query based on status filter
    let whereClause = "";
    let queryParams = [];

    if (status !== "all") {
      whereClause = "WHERE status = ?";
      queryParams.push(status);
    }

    // Get total count
    const countResult = await query({
      query: `SELECT COUNT(*) as total FROM subscribers ${whereClause}`,
      values: queryParams,
    });
    const total = countResult[0].total;

    // Get subscribers
    const subscribers = await query({
      query: `
        SELECT id, email, status, subscribed_at, unsubscribed_at 
        FROM subscribers 
        ${whereClause}
        ORDER BY subscribed_at DESC 
        LIMIT ? OFFSET ?
      `,
      values: [...queryParams, limit, offset],
    });

    return NextResponse.json({
      subscribers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Subscriber ID is required" },
        { status: 400 },
      );
    }

    await query({
      query: "DELETE FROM subscribers WHERE id = ?",
      values: [id],
    });

    return NextResponse.json({ message: "Subscriber deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return NextResponse.json(
      { error: "Failed to delete subscriber" },
      { status: 500 },
    );
  }
}
