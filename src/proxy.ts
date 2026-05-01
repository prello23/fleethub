import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

// Next.js 16 proxy — must be a default export or named "proxy" export
export default auth

export const config = {
  matcher: ["/rooms/:path*", "/admin/:path*", "/superadmin/:path*"],
}
