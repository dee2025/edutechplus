import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

export async function GET(req) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get active users in last 15 minutes
    const [[activeResult]] = await pool.execute(
      `SELECT COUNT(DISTINCT CONCAT(COALESCE(user_id, ip), user_agent)) AS active_users 
       FROM user_activity 
       WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)`,
    );

    const [[onlineResult]] = await pool.execute(
      `SELECT COUNT(DISTINCT ip) AS unique_ips 
       FROM user_activity 
       WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)`,
    );

    const [[usersResult]] = await pool.execute(
      `SELECT COUNT(DISTINCT user_id) AS logged_in_users 
       FROM user_activity 
       WHERE user_id IS NOT NULL AND last_activity >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)`,
    );

    return NextResponse.json({
      active_users: activeResult?.active_users || 0,
      unique_visitors: onlineResult?.unique_ips || 0,
      logged_in_users: usersResult?.logged_in_users || 0,
      time_window: "15 minutes",
    });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
