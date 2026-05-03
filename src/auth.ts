import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          // Direct better-sqlite3 — synchronous, zero extra threads, guaranteed to work
          const { db } = await import("@/lib/db")
          const user = db.prepare(
            "SELECT id, name, email, password, role, apartment FROM \"User\" WHERE email = ?"
          ).get(credentials.email as string) as {
            id: string; name: string; email: string; password: string
            role: string; apartment: string | null
          } | undefined

          if (!user) return null

          const valid = await bcrypt.compare(credentials.password as string, user.password)
          if (!valid) return null

          return { id: user.id, name: user.name, email: user.email, role: user.role, apartment: user.apartment }
        } catch (err) {
          console.error("[auth] authorize error:", err)
          return null
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
        token.apartment = user.apartment
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
})
