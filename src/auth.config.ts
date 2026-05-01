import type { NextAuthConfig } from "next-auth"
import { NextResponse } from "next/server"

// Lightweight auth config with no Prisma — safe to use in Edge (proxy)
export const authConfig = {
  providers: [],
  trustHost: true,
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

      if (pathname.startsWith("/rooms") || pathname === "/my-bookings" || pathname === "/profile") {
        if (!isLoggedIn) {
          return NextResponse.redirect(new URL("/login", nextUrl))
        }
        return true
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role?: string }).role ?? ""
        token.apartment = (user as { apartment?: string | null }).apartment
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      session.user.apartment = token.apartment as string | null | undefined
      return session
    },
  },
} satisfies NextAuthConfig
