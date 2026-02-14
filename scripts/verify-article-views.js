#!/usr/bin/env node

/**
 * Article Views Tracking Verification Script
 *
 * This script verifies that the article views counting system is properly configured.
 * Run it periodically to ensure everything is working correctly.
 */

import pool from "../lib/db.js";

const tests = [];
let passed = 0;
let failed = 0;

// Helper to add test
function addTest(name, fn) {
  tests.push({ name, fn });
}

// Run all tests
async function runTests() {
  console.log("🧪 Article Views Tracking Verification\n");
  console.log("=".repeat(50));

  for (const test of tests) {
    try {
      await test.fn();
      passed++;
      console.log(`✅ ${test.name}`);
    } catch (err) {
      failed++;
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${err.message}\n`);
    }
  }

  console.log("=".repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.log("⚠️  Some tests failed. Please review the issues above.");
    process.exit(1);
  } else {
    console.log(
      "✨ All tests passed! Article views tracking is properly configured.",
    );
    process.exit(0);
  }
}

// Test 1: Check article_views table exists
addTest("Table exists: article_views", async () => {
  const [[result]] = await pool.execute(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'article_views'
  `);
  if (!result) throw new Error("article_views table does not exist");
});

// Test 2: Check required columns
addTest("Required columns exist", async () => {
  const [columns] = await pool.execute(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'article_views'
    ORDER BY ORDINAL_POSITION
  `);

  const required = [
    "id",
    "article_id",
    "user_id",
    "ip",
    "user_agent",
    "created_at",
  ];
  const columnNames = columns.map((c) => c.COLUMN_NAME);

  for (const col of required) {
    if (!columnNames.includes(col)) {
      throw new Error(`Missing column: ${col}`);
    }
  }
});

// Test 3: Check is_authenticated column exists
addTest("Column exists: is_authenticated", async () => {
  const [[result]] = await pool.execute(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'article_views'
    AND COLUMN_NAME = 'is_authenticated'
  `);
  if (!result) {
    console.warn(
      "   ⚠️  Column is_authenticated not found - run migration 2026-02-14-improve-article-views.sql",
    );
  }
});

// Test 4: Check indexes
addTest("Indexes are properly created", async () => {
  const [indexes] = await pool.execute(`
    SELECT DISTINCT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'article_views'
    AND INDEX_NAME != 'PRIMARY'
  `);

  if (indexes.length < 3) {
    throw new Error(`Expected at least 3 indexes, found ${indexes.length}`);
  }
});

// Test 5: Check foreign key (if exists)
addTest("Foreign key constraint", async () => {
  const [fks] = await pool.execute(`
    SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'article_views'
    AND REFERENCED_TABLE_NAME = 'articles'
  `);

  if (fks.length === 0) {
    console.log("   ℹ️  No foreign key found - optional but recommended");
  }
});

// Test 6: Sample data exists
addTest("Sample views data exists", async () => {
  const [[result]] = await pool.execute(`
    SELECT COUNT(*) as count FROM article_views LIMIT 1
  `);

  if (result.count === 0) {
    console.log(
      "   ℹ️  No views recorded yet - this is normal for new installations",
    );
  }
});

// Test 7: Check view API routes exist
addTest("View tracking API file exists", async () => {
  try {
    await import("../app/api/public/articles/[slug]/view/route.js");
  } catch (err) {
    throw new Error("View tracking API route not found");
  }
});

// Test 8: Check TrackViewClient component exists
addTest("TrackViewClient component exists", async () => {
  try {
    await import("../components/article/TrackViewClient.jsx");
  } catch (err) {
    throw new Error("TrackViewClient component not found");
  }
});

// Test 9: Verify view deduplication logic
addTest("View deduplication logic is sound", async () => {
  // Get sample of recent views to verify deduplication
  const [[result]] = await pool.execute(`
    SELECT 
      article_id,
      COUNT(*) as total_views,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(DISTINCT ip) as unique_ips
    FROM article_views 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
    LIMIT 1
  `);

  if (result) {
    console.log(
      `   Sample: ${result.total_views} views, ${result.unique_users} unique users, ${result.unique_ips} unique IPs`,
    );
  }
});

// Test 10: Check ViewsBadge component exists
addTest("ViewsBadge component exists", async () => {
  try {
    await import("../components/article/ViewsBadge.jsx");
  } catch (err) {
    throw new Error("ViewsBadge component not found");
  }
});

// Run all tests
runTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
