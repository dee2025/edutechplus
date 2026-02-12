import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const [preferences] = await db.query(
      `SELECT * FROM user_preferences WHERE user_id = ?`,
      [userId]
    );

    if (!preferences.length) {
      // Create default preferences
      await db.query(
        `INSERT INTO user_preferences (user_id) VALUES (?)`,
        [userId]
      );
      
      return NextResponse.json({
        user_id: userId,
        default_language: 'en',
        default_mode: 'tutor',
        theme: 'dark'
      });
    }

    return NextResponse.json(preferences[0]);
  } catch (error) {
    console.error('Preferences API error:', error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { userId, defaultLanguage, defaultMode, theme } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await db.query(
      `INSERT INTO user_preferences (user_id, default_language, default_mode, theme)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       default_language = VALUES(default_language),
       default_mode = VALUES(default_mode),
       theme = VALUES(theme),
       updated_at = NOW()`,
      [userId, defaultLanguage || 'en', defaultMode || 'tutor', theme || 'dark']
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}