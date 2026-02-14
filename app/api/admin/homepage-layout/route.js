import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getToken(req) {
  return req.cookies.get("admin_auth_token")?.value;
}

const DEFAULT_LAYOUT = {
  sections: {
    hero_main: { items: [] },
    hero_side: { items: [] },
    featured: { items: [] },
    latest: { auto: true, count: 6 },
  },
};

export async function GET(req) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  jwt.verify(token, process.env.JWT_SECRET);

  const [rows] = await pool.execute(
    "SELECT config_json FROM homepage_layout WHERE layout_key = 'homepage' LIMIT 1",
  );

  if (!rows.length) {
    return NextResponse.json(DEFAULT_LAYOUT);
  }

  return NextResponse.json(rows[0].config_json || DEFAULT_LAYOUT);
}

export async function PUT(req) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "super_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const configJson = body?.config || DEFAULT_LAYOUT;

  await pool.execute(
    "INSERT INTO homepage_layout (layout_key, config_json) VALUES ('homepage', ?) ON DUPLICATE KEY UPDATE config_json = VALUES(config_json), updated_at = CURRENT_TIMESTAMP",
    [JSON.stringify(configJson)],
  );

  return NextResponse.json({ ok: true });
}
