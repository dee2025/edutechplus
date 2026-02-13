import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, lessonId, message, mode, language, chatId } =
      await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (!process.env.CF_ACC_ID || !process.env.CF_API_TOKEN) {
      return NextResponse.json(
        { error: "AI service credentials are not configured" },
        { status: 500 },
      );
    }

    // Get or create chat session
    let currentChatId = chatId;
    if (!currentChatId) {
      const [chat] = await db.query(
        `INSERT INTO ai_chats (user_id, lesson_id, mode, title, last_message_at) 
         VALUES (?, ?, ?, LEFT(?, 50), NOW())`,
        [userId, lessonId || null, mode, message],
      );
      currentChatId = chat.insertId;
    } else {
      // Update last message time
      await db.query(
        `UPDATE ai_chats SET last_message_at = NOW() WHERE id = ?`,
        [currentChatId],
      );
    }

    // Save user message immediately
    const [userMessage] = await db.query(
      `INSERT INTO ai_messages (chat_id, role, message) VALUES (?, 'user', ?)`,
      [currentChatId, message],
    );

    // Update message count
    await db.query(
      `UPDATE ai_chats SET message_count = message_count + 1 WHERE id = ?`,
      [currentChatId],
    );

    // Load lesson content if lessonId provided
    let lessonContent = "";
    if (lessonId) {
      const [lessonRows] = await db.query(
        "SELECT title, content FROM lessons WHERE id = ?",
        [lessonId],
      );
      lessonContent = lessonRows?.[0]?.content || "";
    }

    // Get user preferences
    const [prefRows] = await db.query(
      `SELECT default_language, default_mode FROM user_preferences WHERE user_id = ?`,
      [userId],
    );

    const userPrefs = prefRows?.[0] || {};
    const activeLanguage = language || userPrefs.default_language || "en";
    const activeMode = mode || userPrefs.default_mode || "tutor";

    const modeInstructions = {
      "practice-test":
        "You are a world-class exam preparation expert who creates professional-grade MCQ papers identical to real competitive exams. Your role is to generate highly structured, challenging, and authentic practice questions that prepare students for actual exams. Each question must be meticulously crafted with true-to-exam difficulty and content standards.",
      tutor:
        "Explain concepts step by step like a patient teacher. Use examples and analogies.",
      explain:
        "Provide clear, concise explanations. Break down complex ideas into simple terms.",
      quiz: "Create engaging multiple choice questions. Each question should have 4 options. Format as:\nQuestion 1: [question]\nA. [option]\nB. [option]\nC. [option]\nD. [option]\nAnswer: [correct letter]\nExplanation: [brief explanation]",
    };

    const langInstructions = {
      en: "Respond in clear, professional English.",
      hi: "सरल हिंदी में उत्तर दें। (Respond in simple Hindi)",
    };

    const responseGuidelines =
      activeMode === "practice-test"
        ? `
📋 STRICT FORMATTING REQUIREMENTS:
- NO introductions, descriptions, or preambles. Start directly with Question 1.
- Maintain consistent spacing between questions (blank line between each).
- Follow this exact format PRECISELY for every question:

Question 1: [Clear, concise, well-structured question text]
A. [Option A - realistic distractor]
B. [Option B - realistic distractor]
C. [Option C - realistic or correct answer]
D. [Option D - realistic distractor]
Answer: C. [Exact full text of correct option]
Explanation: [2-3 lines explaining why C is correct, common mistakes, and key concept]

🎯 QUESTION GENERATION STANDARDS:
- Questions must match the specified difficulty level (Easy/Medium/Hard)
- Include only questions relevant to the specified topic and exam type
- Vary question types: direct recall, application, analysis, comparison, calculation
- Progress difficulty naturally (easier questions first, harder at the end)
- No question should be ambiguous or have multiple correct answers

⚙️ OPTION DESIGN (Critical for Exam Realism):
- All 4 options must be plausible to prevent random guessing
- Distractors should reflect common student misconceptions
- Avoid obviously wrong options
- Ensure only ONE correct answer per question
- Similar length and complexity for all options
- No typographical errors or grammatical mistakes

📝 EXPLANATION QUALITY:
- Explain why the correct answer is right
- Address why students commonly choose wrong answers
- Reference key concepts, formulas, or principles
- Keep explanations concise but comprehensive

⛔ CRITICAL REQUIREMENT FOR ANSWER KEY:
After generating ALL questions, MUST include a final summary line on a new line:
Correct Answers: Q1-C, Q2-A, Q3-D, Q4-B, Q5-D, ... (list ALL question numbers with their correct answer letters)

This answer key line is ESSENTIAL and MUST be included at the very end, after all explanations.

⛔ FINAL RULES:
- NO additional text, headers, or commentary outside questions and answer key
- Start with 'Question 1:' 
- End with 'Correct Answers: Q1-X, Q2-X, ...' format
`
        : `
- Be accurate and educational
- Use proper formatting (headings, bullet points, code blocks if relevant)
- Include examples where helpful
- If explaining code, provide working examples
- For quizzes, follow the specified format exactly
- Keep responses well-structured but natural
- Avoid unnecessary fluff
- If unsure, acknowledge limitations
`;

    const prompt = `
${modeInstructions[activeMode]}

🌐 Language: ${langInstructions[activeLanguage]}

📋 PAPER SPECIFICATIONS:
${message}

${responseGuidelines.trim()}

Now generate the exam paper:
`;

    // Calculate dynamic max_tokens based on question count
    let maxTokens = 6000; // default
    if (activeMode === "practice-test" || activeMode === "quiz") {
      // Extract question count from message (e.g., "Number of questions: 20")
      const questionMatch = message.match(
        /number\s+of\s+questions\s*[:\-]\s*(\d+)/i,
      );
      if (questionMatch) {
        const questionCount = parseInt(questionMatch[1]);
        // Each question needs ~300 tokens (question + options + answer + explanation)
        // Add 1000 for buffer and final answer key
        maxTokens = Math.max(2000, Math.min(15000, questionCount * 300 + 1000));
      }
    }

    // Call AI API
    const aiRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACC_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stream: true,
          max_tokens: maxTokens,
          temperature:
            activeMode === "practice-test" || activeMode === "quiz" ? 0.6 : 0.7,
          messages: [
            {
              role: "system",
              content:
                "You are an expert AI tutor. You provide accurate, helpful, and well-structured responses.",
            },
            { role: "user", content: prompt },
          ],
        }),
      },
    );

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      throw new Error(`AI API error: ${aiRes.status} ${errorText}`);
    }

    // Insert assistant message placeholder
    const [assistantMessage] = await db.query(
      `INSERT INTO ai_messages (chat_id, role, message) VALUES (?, 'assistant', '')`,
      [currentChatId],
    );

    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiRes.body.getReader();

        try {
          // In your stream handling, make sure to properly parse the response
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);

            // Cloudflare AI returns data in a specific format
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data:")) {
                const data = line.slice(5).trim();

                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  // Make sure we're getting the actual response text
                  const token = parsed.response || parsed.text || "";

                  // Send clean token to client
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        token: String(token).replace(/\[object Object\]/g, ""),
                      })}\n\n`,
                    ),
                  );

                  fullResponse += token;
                } catch (e) {
                  // If it's not JSON, it might be plain text
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        token: data.replace(/\[object Object\]/g, ""),
                      })}\n\n`,
                    ),
                  );
                  fullResponse += data;
                }
              }
            }
          }

          // Update assistant message with full response
          await db.query(`UPDATE ai_messages SET message = ? WHERE id = ?`, [
            fullResponse,
            assistantMessage.insertId,
          ]);

          // Update message count
          await db.query(
            `UPDATE ai_chats SET message_count = message_count + 1 WHERE id = ?`,
            [currentChatId],
          );

          // Generate and update chat title if first message
          const [countResult] = await db.query(
            `SELECT COUNT(*) as count FROM ai_messages WHERE chat_id = ? AND role = 'user'`,
            [currentChatId],
          );

          if (countResult[0].count === 1) {
            const title =
              message.length > 50 ? message.substring(0, 47) + "..." : message;
            await db.query(`UPDATE ai_chats SET title = ? WHERE id = ?`, [
              title,
              currentChatId,
            ]);
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error while processing request",
      },
      { status: 500 },
    );
  }
}
