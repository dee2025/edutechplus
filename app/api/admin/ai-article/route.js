import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

function parseJsonResponse(text) {
  if (!text) return null;
  const raw = String(text).trim();

  // Remove code fence markers
  const cleaned = raw
    .replace(/```json[\n\r]*/gi, "")
    .replace(/[\n\r]*```/g, "")
    .trim();

  // Find JSON object boundaries
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) return null;

  let jsonText = cleaned.slice(start, end + 1);

  try {
    // First attempt: direct parse
    const parsed = JSON.parse(jsonText);

    // Validate required fields
    if (!parsed.subtitle || !parsed.excerpt || !parsed.content_html) {
      console.warn("Missing required fields in AI response:", {
        hasSubtitle: !!parsed.subtitle,
        hasExcerpt: !!parsed.excerpt,
        hasContentHtml: !!parsed.content_html,
      });
      return null;
    }

    return parsed;
  } catch (e) {
    // Second attempt: sanitize control characters in the JSON string
    try {
      // Replace unescaped newlines/tabs with spaces within the JSON
      jsonText = jsonText.replace(/[\n\r\t]/g, " ");
      const parsed = JSON.parse(jsonText);

      // Validate required fields
      if (!parsed.subtitle || !parsed.excerpt || !parsed.content_html) {
        console.warn("Missing required fields after sanitization");
        return null;
      }

      return parsed;
    } catch (e2) {
      console.error(
        "JSON parse error after sanitization:",
        e2.message,
        "Text:",
        jsonText.slice(0, 300),
      );
      return null;
    }
  }
}

function normalizeTags(tags) {
  if (!tags) return null;
  if (Array.isArray(tags)) {
    return tags
      .map((t) => String(t).trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 15);
  }
  return String(tags)
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 15);
}

export async function POST(req) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  jwt.verify(token, process.env.JWT_SECRET);

  const { title, categories } = await req.json();

  if (!title || !Array.isArray(categories) || categories.length === 0) {
    return NextResponse.json(
      { message: "Title and categories are required" },
      { status: 400 },
    );
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const model =
    process.env.CLOUDFLARE_AI_MODEL || "@cf/meta/llama-3.3-70b-instruct";

  if (!accountId || !apiToken) {
    return NextResponse.json(
      { message: "Cloudflare AI credentials not configured" },
      { status: 500 },
    );
  }

  const systemPrompt =
    "You are a senior technical writer. Generate ONLY a valid JSON object with NO other text. Keys: subtitle, excerpt, content_html, tags, seo_title, seo_description, read_time. tags is an array. content_html is valid HTML. IMPORTANT: Generate the JSON as a single-line minified object (no line breaks within the JSON structure). The content_html field should contain properly formatted HTML with line breaks WITHIN the HTML tags themselves, but the overall JSON must be on one line. Do not output anything except the JSON object.";

  const userPrompt = `Create a comprehensive article. Output ONLY minified JSON (single line) with this structure:
{"subtitle":"...","excerpt":"...","content_html":"...","tags":[...],"seo_title":"...","seo_description":"...","read_time":N}

Title: ${title}
Categories: ${categories.join(", ")}

IMPORTANT JSON FORMAT:
- Generate the JSON as ONE CONTINUOUS LINE (no newlines in the JSON structure)
- The content_html field contains HTML - newlines WITHIN HTML tags are OK
- For example: "content_html":"<h2>Title</h2><p>Para 1</p><p>Para 2</p>"
- Escape any quotes in the content: use \\" for quotes inside strings

CODE FORMATTING IN THE ARTICLE (inside content_html):
Format code blocks with proper line breaks WITHIN the HTML:
<pre><code>const students = [
  { name: 'John', score: 90 },
  { name: 'Jane', score: 70 }
];</code></pre>

Article requirements:
- 1000-1500 words total
- Intro explaining context, 5-8 h2 sections, strong conclusion
- Real-world examples and use cases
- 2-3 properly formatted code examples (with line breaks within code)
- 2-3 bullet lists and 1-2 numbered lists
- Best practices and pitfalls discussion
- 8-15 tags (array format)
- 6-8 minute read_time
- Clean, valid HTML

Output ONLY the complete JSON object on a single line.`;

  const cfRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 4500,
      }),
    },
  );

  if (!cfRes.ok) {
    const errText = await cfRes.text();
    return NextResponse.json(
      {
        message: "Cloudflare AI request failed",
        model: model,
        details: errText,
        hint: "Check if model is available. Try @cf/meta/llama-3.1-70b-instruct if 3.3 is not available.",
      },
      { status: 502 },
    );
  }

  const cfJson = await cfRes.json();
  const responseText =
    cfJson?.result?.response ||
    cfJson?.result?.output_text ||
    cfJson?.result?.text ||
    cfJson?.result?.output?.[0]?.text ||
    "";

  const parsed = parseJsonResponse(responseText);
  if (!parsed) {
    const preview = responseText.slice(0, 500);
    console.error("Parse failed. Response preview:", preview);
    return NextResponse.json(
      {
        message: "AI response could not be parsed",
        hint: "Response may not be valid JSON. Check that AI generates JSON-only output.",
        preview: preview,
      },
      { status: 502 },
    );
  }

  const payload = {
    subtitle: parsed.subtitle || "",
    excerpt: parsed.excerpt || "",
    content_html: parsed.content_html || "",
    tags: normalizeTags(parsed.tags),
    seo_title: parsed.seo_title || "",
    seo_description: parsed.seo_description || "",
    read_time: Number(parsed.read_time) || null,
  };

  return NextResponse.json(payload);
}
