import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const [categories] = await pool.query(
        `
        SELECT id, name, slug
        FROM categories
        WHERE is_active = 1
        ORDER BY name ASC
        `
    );

    return NextResponse.json(categories);
}
