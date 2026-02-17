import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Get trending tags based on article count in each tag
    try {
      const tags = await query({
        query: `
          SELECT 
            t.id, t.name, t.slug,
            COUNT(at.article_id) as article_count
          FROM tags t
          LEFT JOIN article_tags at ON at.tag_id = t.id
          LEFT JOIN articles a ON a.id = at.article_id AND a.status = 'published'
          GROUP BY t.id
          HAVING article_count > 0
          ORDER BY article_count DESC
          LIMIT 20
        `,
        values: [],
      });

      return NextResponse.json({ tags });
    } catch (tableErr) {
      // article_tags table doesn't exist yet - return empty tags
      if (tableErr.code === 'ER_NO_SUCH_TABLE') {
        return NextResponse.json({ tags: [] });
      }
      throw tableErr;
    }
  } catch (err) {
    console.error("Error fetching trending tags:", err);
    return NextResponse.json(
      { error: "Failed to fetch trending tags" },
      { status: 500 },
    );
  }
}
