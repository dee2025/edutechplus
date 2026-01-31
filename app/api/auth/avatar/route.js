import { verifyToken } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    const userId = payload.id;

    const form = await req.formData();
    const file = form.get("avatar");
    if (!file)
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 },
      );

    const mime = file.type;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(mime)) {
      return NextResponse.json(
        { message: "Invalid file type" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const maxBytes = 3 * 1024 * 1024; // 3MB
    if (buffer.length > maxBytes) {
      return NextResponse.json(
        { message: "File too large (max 3MB)" },
        { status: 413 },
      );
    }

    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;

    const timestamp = Date.now();
    const public_id = `user_${userId}_${timestamp}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "users",
      public_id,
      overwrite: true,
      resource_type: "image",
      transformation: [{ width: 512, height: 512, crop: "limit" }],
    });

    // Persist avatar URL to user record
    await pool.query("UPDATE users SET avatar_url = ? WHERE id = ?", [
      result.secure_url,
      userId,
    ]);

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
