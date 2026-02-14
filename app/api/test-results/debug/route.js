import db from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Debug endpoint to check database connection and table structure
 * GET /api/test-results/debug
 */
export async function GET(req) {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      checks: {
        connectionTest: null,
        tableStructure: null,
        dataCount: null,
      },
      errors: [],
    };

    // Test 1: Database connection
    try {
      const [connTest] = await db.query("SELECT 1 as test");
      results.checks.connectionTest = {
        status: "OK",
        message: "Database connection successful",
      };
    } catch (error) {
      results.checks.connectionTest = {
        status: "FAILED",
        message: error.message,
      };
      results.errors.push(`Connection test failed: ${error.message}`);
    }

    // Test 2: Check tables exist and structure
    try {
      const [tables] = await db.query(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()",
      );

      const tableNames = tables.map((t) => t.TABLE_NAME);
      const hasTestResults = tableNames.includes("test_results");
      const hasTestStats = tableNames.includes("test_statistics");

      results.checks.tableStructure = {
        status: hasTestResults && hasTestStats ? "OK" : "MISSING",
        allTables: tableNames,
        testResultsExists: hasTestResults,
        testStatisticsExists: hasTestStats,
      };

      if (hasTestResults) {
        const [columns] = await db.query("DESCRIBE test_results");
        results.checks.tableStructure.testResultsColumns = columns.map(
          (c) => c.Field,
        );
      }

      if (hasTestStats) {
        const [statsColumns] = await db.query("DESCRIBE test_statistics");
        results.checks.tableStructure.testStatisticsColumns = statsColumns.map(
          (c) => c.Field,
        );
      }
    } catch (error) {
      results.checks.tableStructure = {
        status: "FAILED",
        message: error.message,
      };
      results.errors.push(`Table structure check failed: ${error.message}`);
    }

    // Test 3: Check data count
    try {
      const [resultCount] = await db.query(
        "SELECT COUNT(*) as count FROM test_results",
      );
      const [statsCount] = await db.query(
        "SELECT COUNT(*) as count FROM test_statistics",
      );

      results.checks.dataCount = {
        status: "OK",
        testResults: resultCount[0].count,
        testStatistics: statsCount[0].count,
      };
    } catch (error) {
      results.checks.dataCount = {
        status: "FAILED",
        message: error.message,
      };
      results.errors.push(`Data count check failed: ${error.message}`);
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Debug check failed",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
