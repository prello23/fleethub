import type { NextAuthConfig } from "next-auth"
import { NextResponse } from "next/server"

// Lightweight auth config with no Prisma — safe to use in Edge (proxy)
export const authConfig = {
  providers: [],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const role = (auth?.user as { role?: string } | undefined)?.role
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      if (pathname.startsWith("/superadmin")) {
        if (role !== "SUPER_ADMIN") {
          return NextResponse.redirect(new URL("/rooms", nextUrl))
        }
        return true
      }

      if (pathname.startsWith("/admin")) {
        if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
          return NextResponse.redirect(new URL("/rooms", nextUrl))
        }
        return true
      }

      if (pathname.startsWith("/rooms")) {
        if (!isLoggedIn) {
          return NextResponse.redirect(new URL("/login", nextUrl))
        }
        return true
      }

      return true
    },
  },
} satisfies NextAuthConfig
