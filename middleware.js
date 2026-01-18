import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/api/admin")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      const payload = await verifyToken(token);
      const role = payload.role;
      if (
        role === "editor" &&
        (
          pathname.startsWith("/admin/admins") ||
          pathname.startsWith("/admin/ads"))
      ) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
