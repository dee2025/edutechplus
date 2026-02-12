import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, lessonId, message, mode, language, chatId } =
      await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
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

    const prompt = `
You are an expert AI tutor with years of teaching experience.

📚 CONTEXT:
${activeMode.toUpperCase()} Mode: ${modeInstructions[activeMode]}
🌐 Language: ${langInstructions[activeLanguage]}

📖 LESSON MATERIAL:
${lessonContent || "No specific lesson context provided."}

💬 STUDENT QUESTION:
${message}

🎯 RESPONSE GUIDELINES:
- Be accurate and educational
- Use proper formatting (headings, bullet points, code blocks if relevant)
- Include examples where helpful
- If explaining code, provide working examples
- For quizzes, follow the specified format exactly
- Keep responses well-structured but natural
- Avoid unnecessary fluff
- If unsure, acknowledge limitations

Begin your response now:
`;

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
          max_tokens: 2048,
          temperature: activeMode === "quiz" ? 0.8 : 0.7,
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
      throw new Error(`AI API error: ${aiRes.status}`);
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
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
