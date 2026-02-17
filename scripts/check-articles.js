require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function checkArticles() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "82.180.144.17",
    user: process.env.DB_USER || "evadmin",
    password: process.env.DB_PASSWORD || "X&p6k8o81",
    database: process.env.DB_NAME || "dbevinfo",
  });

  try {
    // Check for Gautam Sharma's articles
    const [articles] = await connection.execute(
      `SELECT a.id, a.title, a.slug, u.username, u.name 
       FROM articles a 
       LEFT JOIN users u ON u.id = a.author_id 
       WHERE u.username = 'gautam-sharma' OR a.author_id = 5`
    );

    console.log("\n📰 Articles by gautam-sharma:\n");
    if (articles.length === 0) {
      console.log("❌ No articles found for this user");
    } else {
      articles.forEach((a) => {
        console.log(
          `- "${a.title}" (slug: ${a.slug}) by ${a.name} (@${a.username})`
        );
      });
    }

    // Check all published articles to see what we have
    const [allArticles] = await connection.execute(
      "SELECT COUNT(*) as count FROM articles WHERE status = 'published'"
    );

    console.log(`\nTotal published articles: ${allArticles[0].count}`);

    // List articles with authors
    const [sampleArticles] = await connection.execute(
      `SELECT 
        a.id, a.title, a.slug, u.username, u.name 
       FROM articles a 
       LEFT JOIN users u ON u.id = a.author_id 
       WHERE a.status = 'published'
       LIMIT 5`
    );

    console.log("\n📋 Sample articles:\n");
    sampleArticles.forEach((a) => {
      console.log(
        `- "${a.title}" by ${a.name} (@${a.username || 'NO_USERNAME'})`
      );
    });
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await connection.end();
  }
}

checkArticles();
