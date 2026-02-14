import pool from "../lib/db.js";

async function runMigration() {
  try {
    console.log("🔄 Running article_views improvement migration...\n");

    // 1. Add foreign key constraint
    try {
      console.log("1️⃣  Adding foreign key constraint...");
      await pool.execute(
        `ALTER TABLE article_views
         ADD CONSTRAINT fk_article_views_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE`,
      );
      console.log("   ✅ Foreign key added\n");
    } catch (e) {
      if (
        e.message.includes("already exists") ||
        e.message.includes("Duplicate")
      ) {
        console.log("   ℹ️  Foreign key already exists\n");
      } else {
        throw e;
      }
    }

    // 2. Add is_authenticated column
    try {
      console.log("2️⃣  Adding is_authenticated column...");
      await pool.execute(
        `ALTER TABLE article_views
         ADD COLUMN is_authenticated BOOLEAN DEFAULT FALSE`,
      );
      console.log("   ✅ Column added\n");
    } catch (e) {
      if (
        e.message.includes("already exists") ||
        e.message.includes("Duplicate")
      ) {
        console.log("   ℹ️  Column already exists\n");
      } else {
        throw e;
      }
    }

    // 3. Update existing rows
    console.log("3️⃣  Updating existing rows...");
    const [updateResult] = await pool.execute(
      `UPDATE article_views SET is_authenticated = TRUE WHERE user_id IS NOT NULL`,
    );
    console.log(`   ✅ Updated ${updateResult.affectedRows} rows\n`);

    // 4. Add indexes
    const indexes = [
      {
        name: "idx_article_id",
        sql: `ALTER TABLE article_views ADD INDEX idx_article_id (article_id)`,
      },
      {
        name: "idx_article_created",
        sql: `ALTER TABLE article_views ADD INDEX idx_article_created (article_id, created_at)`,
      },
      {
        name: "idx_article_user_created",
        sql: `ALTER TABLE article_views ADD INDEX idx_article_user_created (article_id, user_id, created_at)`,
      },
      {
        name: "idx_article_ip_created",
        sql: `ALTER TABLE article_views ADD INDEX idx_article_ip_created (article_id, ip, created_at)`,
      },
      {
        name: "idx_article_ua_created",
        sql: `ALTER TABLE article_views ADD INDEX idx_article_ua_created (article_id, user_agent, created_at)`,
      },
    ];

    console.log("4️⃣  Adding indexes...");
    for (const idx of indexes) {
      try {
        await pool.execute(idx.sql);
        console.log(`   ✅ ${idx.name}`);
      } catch (e) {
        if (
          e.message.includes("already exists") ||
          e.message.includes("Duplicate")
        ) {
          console.log(`   ℹ️  ${idx.name} (already exists)`);
        } else {
          console.log(`   ⚠️  ${idx.name}: ${e.message}`);
        }
      }
    }

    console.log("\n✅ Migration completed!\n");

    // Verify
    const [[check]] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME='article_views' AND COLUMN_NAME='is_authenticated'`,
    );

    if (check) {
      console.log("✅ VERIFIED: is_authenticated column exists and is ready!");
    } else {
      console.log("⚠️  WARNING: is_authenticated column not found");
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Migration error:", err.message);
    console.error("\nSQL:", err.sql);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

runMigration();
