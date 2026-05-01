import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  const { pathname } = req.nextUrl
  const role = token?.role as string | undefined

  if (pathname.startsWith("/superadmin")) {
    if (role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/rooms", req.url))
    }
  }

  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/rooms", req.url))
    }
  }

  if (pathname.startsWith("/rooms") && !token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/rooms/:path*", "/admin/:path*", "/superadmin/:path*"],
}
