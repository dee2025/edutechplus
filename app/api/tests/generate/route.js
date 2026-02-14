import { NextResponse } from "next/server";

/**
 * Generate test questions using Cloudflare Workers AI
 * POST /api/tests/generate
 */
export async function POST(req) {
  try {
    const { examName, topic, difficulty, language, questionCount } =
      await req.json();

    if (!examName || !questionCount) {
      return NextResponse.json(
        { error: "examName and questionCount are required" },
        { status: 400 },
      );
    }

    // Generate questions using Cloudflare Workers AI
    const questionsText = await generateQuestionsWithAI(
      parseInt(questionCount),
      examName,
      topic,
      difficulty,
      language,
    );

    // Parse questions from AI response
    const questions = parseQuestionsFromAI(questionsText);

    // Stream response in server-sent events format
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send questions as data chunks
        const questionsJSON = JSON.stringify(questions);
        let sent = 0;

        // Split into chunks and send
        const chunkSize = 50;
        while (sent < questionsJSON.length) {
          const chunk = questionsJSON.substring(sent, sent + chunkSize);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ token: chunk })}\n\n`),
          );
          sent += chunkSize;
        }

        // Send done signal
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Test generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate test",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

/**
 * Generate questions using Cloudflare Workers AI (llama-3.1-8b)
 */
async function generateQuestionsWithAI(
  count,
  examName,
  topic,
  difficulty,
  language,
) {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiToken || !accountId) {
    console.error("❌ Missing Cloudflare credentials");
    console.error("CLOUDFLARE_API_TOKEN:", apiToken ? "✓ Set" : "✗ Missing");
    console.error("CLOUDFLARE_ACCOUNT_ID:", accountId ? "✓ Set" : "✗ Missing");
    throw new Error(
      "Missing Cloudflare API credentials. Please add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to .env.local",
    );
  }

  if (apiToken === "api_token" || accountId === "account_id") {
    console.error("❌ Placeholder credentials detected");
    throw new Error(
      "Cloudflare credentials are still placeholders. Please update .env.local with real values from https://dash.cloudflare.com",
    );
  }

  // Calculate max tokens dynamically based on question count
  const maxTokens = Math.min(count * 350 + 1000, 4096);

  const prompt = `You are an expert exam question generator. Generate EXACTLY ${count} multiple choice questions.

EXAM: ${examName}
${topic ? `TOPIC: ${topic}` : ""}
${difficulty ? `DIFFICULTY: ${difficulty}` : "DIFFICULTY: medium"}
LANGUAGE: ${language || "English"}

FOR EACH QUESTION, USE THIS EXACT FORMAT (do not deviate):

---QUESTION START---
QUESTION: [Write a clear, detailed question]
OPTION_A: [Option A text]
OPTION_B: [Option B text]
OPTION_C: [Option C text]
OPTION_D: [Option D text]
CORRECT_ANSWER: [A or B or C or D only]
EXPLANATION: [Detailed explanation of why this answer is correct]
---QUESTION END---

REQUIREMENTS:
- Generate EXACTLY ${count} questions
- Each question must have all 4 options
- Correct answer must be formatted as single letter: A, B, C, or D
- Vary the correct answers across all questions
- Make questions educational and accurate
- Explanations should be 2-3 sentences long
- Format is CRITICAL - follow it exactly

Now generate all ${count} questions:`;

  try {
    console.log(
      `📝 Generating ${count} questions for ${examName} via Cloudflare AI...`,
    );

    // Cloudflare Workers AI endpoint
    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
    console.log("🔗 API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    console.log("📥 Response Status:", response.status, response.statusText);

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      console.error("❌ Cloudflare API Error Details:");
      console.error("Status:", response.status);
      console.error("Account ID:", accountId);
      console.error("Response:", errorData);

      if (response.status === 404) {
        console.error("\n🔍 Troubleshooting 404 error:");
        console.error("1. Check if Account ID is correct:", accountId);
        console.error("2. Ensure account has Workers AI enabled");
        console.error("3. Verify the model name");
        throw new Error(
          `404 Not Found - Check your Cloudflare Account ID (${accountId.substring(0, 8)}...)`,
        );
      }

      throw new Error(
        `Cloudflare API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("✓ AI Response received");

    if (data.errors && data.errors.length > 0) {
      console.error("❌ Cloudflare API returned errors:", data.errors);
      throw new Error(`Cloudflare error: ${data.errors[0]}`);
    }

    const result = data.result?.response || data.result || "";

    if (!result) {
      console.error("❌ No response from Cloudflare AI");
      throw new Error("No response content from Cloudflare AI");
    }

    console.log("✓ Successfully generated questions via AI");
    return result;
  } catch (error) {
    console.error("❌ Cloudflare AI error:", error.message);
    throw error;
  }
}

/**
 * Parse questions from AI-generated text using new format
 */
function parseQuestionsFromAI(text) {
  const questions = [];

  // Split by the new format markers
  const questionBlocks = text.split("---QUESTION START---");

  console.log(`📊 Found ${questionBlocks.length - 1} question blocks to parse`);

  for (const block of questionBlocks) {
    if (!block.includes("---QUESTION END---")) continue;

    const content = block.split("---QUESTION END---")[0].trim();

    // Extract fields using regex
    const questionMatch = content.match(/QUESTION:\s*([\s\S]*?)(?=OPTION_A:)/i);
    const optionAMatch = content.match(/OPTION_A:\s*([\s\S]*?)(?=OPTION_B:)/i);
    const optionBMatch = content.match(/OPTION_B:\s*([\s\S]*?)(?=OPTION_C:)/i);
    const optionCMatch = content.match(/OPTION_C:\s*([\s\S]*?)(?=OPTION_D:)/i);
    const optionDMatch = content.match(
      /OPTION_D:\s*([\s\S]*?)(?=CORRECT_ANSWER:)/i,
    );
    const answerMatch = content.match(/CORRECT_ANSWER:\s*([A-D])/i);
    const explanationMatch = content.match(/EXPLANATION:\s*([\s\S]*?)(?=$)/i);

    if (!questionMatch || !optionAMatch || !answerMatch) {
      console.log("⚠️  Skipping malformed question block");
      continue;
    }

    const question = questionMatch[1].trim();
    const optionA = optionAMatch[1].trim();
    const optionB = optionBMatch ? optionBMatch[1].trim() : "";
    const optionC = optionCMatch ? optionCMatch[1].trim() : "";
    const optionD = optionDMatch ? optionDMatch[1].trim() : "";
    const answer = answerMatch[1].toUpperCase();
    const explanation = explanationMatch
      ? explanationMatch[1].trim()
      : "See explanation above";

    // Build options array
    const options = [
      ...(optionA ? [`A) ${optionA}`] : []),
      ...(optionB ? [`B) ${optionB}`] : []),
      ...(optionC ? [`C) ${optionC}`] : []),
      ...(optionD ? [`D) ${optionD}`] : []),
    ];

    if (options.length !== 4 || !["A", "B", "C", "D"].includes(answer)) {
      console.log(
        "⚠️  Skipping question with missing options or invalid answer",
      );
      continue;
    }

    const parsedQuestion = {
      id: questions.length + 1,
      question: question,
      options: options,
      answer: answer,
      explanation: explanation,
      difficulty: "mixed",
      topic: "General",
    };

    console.log(`✓ Parsed question ${parsedQuestion.id}`);
    questions.push(parsedQuestion);
  }

  console.log(`📊 Successfully parsed ${questions.length} questions`);

  // If parsing fails completely, return empty and let frontend handle it
  if (questions.length === 0) {
    console.error("❌ Failed to parse any questions from AI response");
    return [];
  }

  return questions;
}

/**
 * Generate mock questions as fallback
 */
function generateMockQuestions(count, examName, topic, difficulty) {
  const questions = [];
  const answers = ["A", "B", "C", "D"];
  const topics = topic ? [topic] : getTopicsForExam(examName);

  for (let i = 1; i <= count; i++) {
    const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
    const question = {
      id: i,
      question: `${selectedTopic} - Question ${i}?\n\nThis is a sample question for testing the system.`,
      options: generateMockOptions(),
      answer: answers[Math.floor(Math.random() * answers.length)],
      explanation: `This is the explanation for question ${i}. Students can learn from this.`,
      difficulty: difficulty || "intermediate",
      topic: selectedTopic,
    };
    questions.push(question);
  }

  return questions;
}

/**
 * Generate mock option text
 */
function generateMockOptions() {
  return [
    "A) First option",
    "B) Second option",
    "C) Third option",
    "D) Fourth option",
  ];
}

/**
 * Generate mock question text as fallback
 */
function generateMockQuestionText(count, examName, topic, difficulty) {
  let text = "";
  const answers = ["A", "B", "C", "D"];

  for (let i = 1; i <= count; i++) {
    const answer = answers[Math.floor(Math.random() * answers.length)];
    text += `QUESTION_START
Q: Sample question ${i} about ${topic || examName}?
A) First option
B) Second option
C) Third option
D) Fourth option
ANSWER: ${answer}
EXPLANATION: This is the explanation for sample question ${i}.
QUESTION_END

`;
  }

  return text;
}

/**
 * Get default topics for each exam type
 */
function getTopicsForExam(examName) {
  const examTopics = {
    JEE: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Vectors",
      "Mechanics",
      "Thermodynamics",
    ],
    NEET: [
      "Biology",
      "Chemistry",
      "Physics",
      "Botany",
      "Zoology",
      "Anatomy",
      "Physiology",
    ],
    GATE: [
      "Data Structures",
      "Algorithms",
      "Database Systems",
      "Operating Systems",
      "Networks",
      "Digital Logic",
    ],
    CAT: [
      "Quantitative Ability",
      "Verbal Ability",
      "Logical Reasoning",
      "Data Interpretation",
    ],
    UPSC: [
      "History",
      "Geography",
      "Polity",
      "Economics",
      "Science & Technology",
      "Current Affairs",
    ],
    GRE: [
      "Verbal Reasoning",
      "Quantitative Reasoning",
      "Analytical Writing",
      "Vocabulary",
    ],
    SAT: ["Math", "Evidence-Based Reading", "Writing & Language", "Logic"],
  };

  return (
    examTopics[examName] || [
      "General Knowledge",
      "Science",
      "Mathematics",
      "Language",
    ]
  );
}
