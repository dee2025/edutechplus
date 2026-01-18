import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: 'Logged out' });

    // 🔥 Clear the admin token cookie
    response.cookies.set({
        name: 'admin_token',
        value: '',
        httpOnly: true,
        path: '/',
        maxAge: 0,
    });

    return response;
}
