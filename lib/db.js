// import mysql from 'mysql2/promise';

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
// });

// export default pool;

import mysql from "mysql2/promise";

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 10000,
  });
}

let pool;

if (!global.mysqlPool) {
  global.mysqlPool = createPool();
}

pool = global.mysqlPool;

// Helper function to execute queries with connection recovery
export async function query(sql, values = []) {
  // Support both calling formats:
  // 1. query(sql, values) - two parameters
  // 2. query({ query: sql, values: values }) - object parameter
  let actualSql = sql;
  let actualValues = values;

  if (typeof sql === "object" && sql.query) {
    actualSql = sql.query;
    actualValues = sql.values || [];
  }

  try {
    const [results] = await pool.execute(actualSql, actualValues);
    return results;
  } catch (error) {
    console.error("Database query error:", error);

    // If connection is closed, try to recreate the pool once
    if (
      error.code === "PROTOCOL_CONNECTION_LOST" ||
      error.message?.includes("closed state") ||
      error.errno === "ECONNRESET"
    ) {
      console.log("⚠️  Database connection lost. Recreating pool...");

      try {
        // Close the old pool
        await pool.end().catch(() => {});

        // Create new pool
        pool = createPool();
        global.mysqlPool = pool;

        // Retry the query
        const [results] = await pool.execute(actualSql, actualValues);
        console.log("✅ Database connection restored");
        return results;
      } catch (retryError) {
        console.error("Database retry failed:", retryError);
        throw retryError;
      }
    }

    throw error;
  }
}

export default pool;
