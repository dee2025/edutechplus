import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public access to admin login endpoints
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/api/admin/login")
  ) {
    return NextResponse.next();
  }

  // Protect admin pages and admin APIs
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Admins use a separate cookie to avoid collisions with site user sessions
    const token = req.cookies.get("admin_auth_token")?.value;

    // For API routes return 401 JSON, for pages redirect to login
    const isApi = pathname.startsWith("/api/");

    if (!token) {
      if (isApi)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      const payload = await verifyToken(token);
      const role = payload.role;

      // Only admin roles can access admin area
      const adminRoles = ["super_admin", "editor"];
      if (!adminRoles.includes(role)) {
        if (isApi)
          return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 },
          );
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }

      // Keep existing editor restrictions for specific admin pages
      if (
        role === "editor" &&
        (pathname.startsWith("/admin/admins") ||
          pathname.startsWith("/admin/ads"))
      ) {
        if (isApi)
          return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 },
          );
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      return NextResponse.next();
    } catch (err) {
      if (isApi)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
