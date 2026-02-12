import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { language, source_code } = await req.json();

    const response = await fetch("https://emkc.org/api/v2/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version: "*",
        files: [{ content: source_code }],
      }),
    });

    const contentType = response.headers.get("content-type");
    const rawText = await response.text();

    // ❌ Piston returned HTML (blocked / rate-limited)
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        {
          error: "Execution service unavailable (Piston blocked request)",
          raw: rawText.slice(0, 150),
        },
        { status: 503 }
      );
    }

    const result = JSON.parse(rawText);

    return NextResponse.json({
      output:
        result.run?.stdout ||
        result.run?.stderr ||
        "No output",
    });
  } catch (err) {
    console.error("Execution error:", err);
    return NextResponse.json(
      { error: "Execution failed" },
      { status: 500 }
    );
  }
}
