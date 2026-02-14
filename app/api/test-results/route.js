import db from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Convert ISO 8601 timestamp to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
 */
function convertToMySQLDateTime(isoString) {
  if (!isoString) return null;
  // Parse ISO 8601 and convert to MySQL format
  const date = new Date(isoString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export async function POST(req) {
  try {
    const {
      userId,
      examName,
      topic,
      difficulty,
      language,
      questionCount,
      correctAnswers,
      wrongAnswers,
      score,
      userAnswers,
      questions,
      completedAt,
    } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Ensure completedAt is provided, default to now if missing
    const timestamp = completedAt || new Date().toISOString();
    const mysqlDateTime = convertToMySQLDateTime(timestamp);

    // Save test result to database
    const [result] = await db.query(
      `INSERT INTO test_results 
       (user_id, exam_name, topic, difficulty, language, question_count, correct_answers, wrong_answers, score, user_answers, questions, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        examName,
        topic || null,
        difficulty,
        language,
        questionCount,
        correctAnswers,
        wrongAnswers,
        score,
        JSON.stringify(userAnswers),
        JSON.stringify(questions),
        mysqlDateTime,
      ],
    );

    // Update or insert test statistics
    await updateTestStatistics(userId);

    return NextResponse.json({
      success: true,
      testId: result.insertId,
      message: "Test result saved successfully",
    });
  } catch (error) {
    console.error("Test result save error:", error);
    return NextResponse.json(
      {
        error: "Failed to save test result",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

async function updateTestStatistics(userId) {
  try {
    // Get all test results for this user
    const [tests] = await db.query(
      `SELECT SUM(correct_answers) as total_correct, 
              SUM(question_count) as total_questions,
              COUNT(*) as total_tests,
              AVG(score) as average_score
       FROM test_results
       WHERE user_id = ?`,
      [userId],
    );

    const stats = tests[0];

    // Check if user stats exist
    const [existing] = await db.query(
      `SELECT id FROM test_statistics WHERE user_id = ?`,
      [userId],
    );

    if (existing.length > 0) {
      // Update existing statistics
      await db.query(
        `UPDATE test_statistics 
         SET total_tests = ?, 
             total_correct = ?, 
             total_questions = ?, 
             average_score = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          stats.total_tests || 0,
          stats.total_correct || 0,
          stats.total_questions || 0,
          stats.average_score || 0,
          userId,
        ],
      );
    } else {
      // Insert new statistics
      await db.query(
        `INSERT INTO test_statistics 
         (user_id, total_tests, total_correct, total_questions, average_score)
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          stats.total_tests || 0,
          stats.total_correct || 0,
          stats.total_questions || 0,
          stats.average_score || 0,
        ],
      );
    }
  } catch (error) {
    console.error("Error updating test statistics:", error);
    // Don't throw - just log the error so test result still saves
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit")) || 10;
    const offset = parseInt(searchParams.get("offset")) || 0;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get test history for user
    const [results] = await db.query(
      `SELECT * FROM test_results 
       WHERE user_id = ? 
       ORDER BY completed_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset],
    );

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM test_results WHERE user_id = ?`,
      [userId],
    );

    return NextResponse.json({
      results: results.map((r) => ({
        ...r,
        userAnswers:
          typeof r.user_answers === "string"
            ? JSON.parse(r.user_answers)
            : r.user_answers,
        questions:
          typeof r.questions === "string"
            ? JSON.parse(r.questions)
            : r.questions,
        score: Number(r.score) || 0,
        correct_answers: Number(r.correct_answers) || 0,
        wrong_answers: Number(r.wrong_answers) || 0,
        question_count: Number(r.question_count) || 0,
      })),
      total: countResult[0].total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Test history fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch test history",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

// New endpoint to get user statistics
export async function PATCH(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get statistics
    const [stats] = await db.query(
      `SELECT * FROM test_statistics WHERE user_id = ?`,
      [userId],
    );

    if (stats.length === 0) {
      return NextResponse.json(
        { error: "No statistics found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      statistics: stats[0],
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch statistics",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
