import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const chatId = searchParams.get('chatId');
    const lessonId = searchParams.get('lessonId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get chat list
    if (!chatId && !lessonId) {
      const [chats] = await db.query(
        `SELECT 
          c.id,
          c.title,
          c.mode,
          c.created_at,
          c.last_message_at,
          c.message_count,
          l.title as lesson_title,
          l.id as lesson_id,
          (SELECT message FROM ai_messages WHERE chat_id = c.id AND role = 'user' ORDER BY created_at ASC LIMIT 1) as first_message,
          (SELECT message FROM ai_messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
         FROM ai_chats c
         LEFT JOIN lessons l ON c.lesson_id = l.id
         WHERE c.user_id = ? AND c.is_archived = FALSE
         ORDER BY c.last_message_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );

      // Get total count
      const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM ai_chats WHERE user_id = ? AND is_archived = FALSE`,
        [userId]
      );

      return NextResponse.json({
        chats,
        total: countResult[0].total,
        limit,
        offset
      });
    }

    // Get specific chat messages
    if (chatId) {
      // Verify ownership
      const [chatCheck] = await db.query(
        `SELECT id FROM ai_chats WHERE id = ? AND user_id = ?`,
        [chatId, userId]
      );

      if (!chatCheck.length) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }

      const [messages] = await db.query(
        `SELECT 
          id,
          role,
          message as text,
          created_at as timestamp
         FROM ai_messages 
         WHERE chat_id = ? 
         ORDER BY created_at ASC`,
        [chatId]
      );

      const [chatInfo] = await db.query(
        `SELECT 
          c.*,
          l.title as lesson_title,
          l.content as lesson_content
         FROM ai_chats c
         LEFT JOIN lessons l ON c.lesson_id = l.id
         WHERE c.id = ?`,
        [chatId]
      );

      return NextResponse.json({
        chat: chatInfo[0],
        messages
      });
    }

    // Get messages by lesson
    if (lessonId) {
      const [messages] = await db.query(
        `SELECT 
          m.*,
          c.title as chat_title,
          c.mode
         FROM ai_messages m
         JOIN ai_chats c ON m.chat_id = c.id
         WHERE c.user_id = ? AND c.lesson_id = ?
         ORDER BY m.created_at DESC
         LIMIT ?`,
        [userId, lessonId, limit]
      );

      return NextResponse.json({ messages });
    }

  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { chatId, userId } = await req.json();

    if (!chatId || !userId) {
      return NextResponse.json({ error: "Chat ID and User ID required" }, { status: 400 });
    }

    // Soft delete - archive instead of permanent delete
    const [result] = await db.query(
      `UPDATE ai_chats SET is_archived = TRUE WHERE id = ? AND user_id = ?`,
      [chatId, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}