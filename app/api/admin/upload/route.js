// import { NextResponse } from 'next/server';
// import fs from 'fs';
// import path from 'path';
// import jwt from 'jsonwebtoken';

// export async function POST(req) {
//     const token = req.cookies.get('auth_token')?.value;
//     if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

//     jwt.verify(token, process.env.JWT_SECRET);

//     const data = await req.formData();
//     const file = data.get('file');
//     if (!file) return NextResponse.json({ message: 'No file' }, { status: 400 });

//     const buffer = Buffer.from(await file.arrayBuffer());
//     const dir = path.join(process.cwd(), 'public/uploads/articles');
//     fs.mkdirSync(dir, { recursive: true });

//     const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
//     fs.writeFileSync(path.join(dir, filename), buffer);

//     return NextResponse.json({
//         url: `/uploads/articles/${filename}`,
//     });
// }



import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
    try {
        // 🔐 Auth
        const token = req.cookies.get("auth_token")?.value;
        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        jwt.verify(token, process.env.JWT_SECRET);

        // 📦 Get file
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json(
                { message: "No file provided" },
                { status: 400 }
            );
        }

        // 🧠 Convert to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // ☁️ Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "articles",           // cloudinary folder
                    resource_type: "image",
                    transformation: [
                        { quality: "auto", fetch_format: "auto" }
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                }
            ).end(buffer);
        });

        // ✅ Success
        return NextResponse.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        });

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);

        return NextResponse.json(
            { message: "Upload failed" },
            { status: 500 }
        );
    }
}
