import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    jwt.verify(token, process.env.JWT_SECRET);

    const data = await req.formData();
    const file = data.get('file');
    if (!file) return NextResponse.json({ message: 'No file' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const dir = path.join(process.cwd(), 'public/uploads/articles');
    fs.mkdirSync(dir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    fs.writeFileSync(path.join(dir, filename), buffer);

    return NextResponse.json({
        url: `/uploads/articles/${filename}`,
    });
}
