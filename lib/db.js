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

const isProd = process.env.NODE_ENV === "production";

function toInt(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const DB_POOL_CONNECTION_LIMIT = toInt(
  process.env.DB_POOL_CONNECTION_LIMIT,
  isProd ? 5 : 10,
);
const DB_POOL_MAX_IDLE = toInt(
  process.env.DB_POOL_MAX_IDLE,
  isProd ? 2 : DB_POOL_CONNECTION_LIMIT,
);
const DB_POOL_QUEUE_LIMIT = toInt(process.env.DB_POOL_QUEUE_LIMIT, 100);
const DB_CONNECT_TIMEOUT_MS = toInt(process.env.DB_CONNECT_TIMEOUT_MS, 10000);
const DB_QUERY_TIMEOUT_MS = toInt(process.env.DB_QUERY_TIMEOUT_MS, 12000);
const DB_MAX_RETRIES = toInt(process.env.DB_MAX_RETRIES, 2);

const RETRYABLE_ERROR_CODES = new Set([
  "ER_CON_COUNT_ERROR",
  "ER_TOO_MANY_USER_CONNECTIONS",
  "ETIMEDOUT",
  "ECONNRESET",
  "PROTOCOL_CONNECTION_LOST",
]);

function isRetryableError(error) {
  if (!error) return false;
  if (RETRYABLE_ERROR_CODES.has(error.code)) return true;

  const message = String(error.message || "").toLowerCase();
  return (
    message.includes("too many connections") ||
    message.includes("timeout") ||
    message.includes("closed state")
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeWithTimeout(sql, values) {
  return pool.execute(
    {
      sql,
      timeout: DB_QUERY_TIMEOUT_MS,
    },
    values,
  );
}

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: DB_POOL_CONNECTION_LIMIT,
    maxIdle: DB_POOL_MAX_IDLE,
    idleTimeout: 60000,
    queueLimit: DB_POOL_QUEUE_LIMIT,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: DB_CONNECT_TIMEOUT_MS,
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

  let lastError;

  for (let attempt = 0; attempt <= DB_MAX_RETRIES; attempt++) {
    try {
      const [results] = await executeWithTimeout(actualSql, actualValues);
      return results;
    } catch (error) {
      lastError = error;
      console.error(`Database query error (attempt ${attempt + 1}):`, error);

      const canRetry = isRetryableError(error) && attempt < DB_MAX_RETRIES;

      if (!canRetry) {
        throw error;
      }

      // Recreate pool if connection is in bad state
      if (
        error.code === "PROTOCOL_CONNECTION_LOST" ||
        String(error.message || "")
          .toLowerCase()
          .includes("closed state")
      ) {
        try {
          await pool.end().catch(() => {});
        } catch {
          // ignore
        }
        pool = createPool();
        global.mysqlPool = pool;
      }

      const backoffMs = Math.min(300 * 2 ** attempt, 1500);
      await wait(backoffMs);
    }
  }

  throw lastError;
}

export default pool;
