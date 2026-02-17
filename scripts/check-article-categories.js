import pool from "../lib/db.js";

async function checkArticles() {
  console.log("🔍 Checking articles without categories...\n");

  try {
    const [articlesWithoutCategory] = await pool.execute(
      `SELECT id, title, slug, category_id 
       FROM articles 
       WHERE category_id IS NULL OR category_id = 0 
       LIMIT 10`,
    );

    if (articlesWithoutCategory.length > 0) {
      console.log("❌ Found articles without categories:");
      articlesWithoutCategory.forEach((article) => {
        console.log(
          `   - ${article.slug} (ID: ${article.id}, category_id: ${article.category_id})`,
        );
      });
    } else {
      console.log("✅ All articles have categories assigned!");
    }

    // Check specific article
    const [article] = await pool.execute(
      `SELECT a.id, a.title, a.slug, a.category_id, c.slug as category_slug, c.name as category_name
       FROM articles a
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.slug = 'what-is-generative-ai-genai'
       LIMIT 1`,
    );

    console.log(
      "\n📄 Checking specific article 'what-is-generative-ai-genai':",
    );
    if (article.length > 0) {
      const a = article[0];
      console.log(`   Title: ${a.title}`);
      console.log(`   Slug: ${a.slug}`);
      console.log(`   Category ID: ${a.category_id}`);
      console.log(`   Category Slug: ${a.category_slug}`);
      console.log(`   Category Name: ${a.category_name}`);

      if (a.category_slug) {
        console.log(
          `\n✅ Redirect URL would be: /${a.category_slug}/${a.slug}`,
        );
      } else {
        console.log(
          `\n❌ ERROR: Article has no category! Redirect would fail.`,
        );
      }
    } else {
      console.log(`   ❌ Article not found`);
    }
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    process.exit(0);
  }
}

checkArticles();
