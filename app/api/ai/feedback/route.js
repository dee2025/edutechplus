import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { messageId, userId, rating, feedbackText } = await req.json();

    if (!messageId || !userId || !rating) {
      return NextResponse.json(
        { error: "Message ID, User ID, and rating required" },
        { status: 400 }
      );
    }

    // Check if feedback already exists
    const [existing] = await db.query(
      `SELECT id FROM ai_feedback WHERE message_id = ? AND user_id = ?`,
      [messageId, userId]
    );

    if (existing.length) {
      // Update existing feedback
      await db.query(
        `UPDATE ai_feedback SET rating = ?, feedback_text = ? WHERE id = ?`,
        [rating, feedbackText || null, existing[0].id]
      );
    } else {
      // Insert new feedback
      await db.query(
        `INSERT INTO ai_feedback (message_id, user_id, rating, feedback_text) 
         VALUES (?, ?, ?, ?)`,
        [messageId, userId, rating, feedbackText || null]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}