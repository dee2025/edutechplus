// Quick script to verify article redirect would work
// Usage: npm run dev then visit http://localhost:3000/articles/what-is-generative-ai-genai

async function testArticleRedirect() {
  try {
    console.log("Testing article redirect route...\n");

    const slugToTest = "what-is-generative-ai-genai";
    const apiUrl = `http://localhost:3000/api/public/articles/${slugToTest}`;

    console.log(`📌 API Endpoint: ${apiUrl}`);
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ Article not found: ${data.message}`);
      return;
    }

    const article = data.article;
    console.log(`\n✅ Article Found:`);
    console.log(`   Title: ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Author: ${article.author_name}`);
    console.log(`   Category Slug: ${article.category_slug}`);

    if (article.category_slug) {
      const redirectUrl = `/${article.category_slug}/${article.slug}`;
      console.log(`\n🔀 Would redirect to: ${redirectUrl}`);
      console.log(`\n📂 Expected URL: http://localhost:3000${redirectUrl}`);
    } else {
      console.log(`\n❌ ERROR: No category assigned to article!`);
      console.log(
        `   The redirect would fail because category_slug is missing.`,
      );
    }
  } catch (error) {
    console.error("Error testing redirect:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testArticleRedirect();
}

export default testArticleRedirect;
