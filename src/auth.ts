import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import Database from "better-sqlite3"

// Use direct SQLite (better-sqlite3) for auth to avoid Prisma adapter issues in production
function getUserByEmail(email: string): { id: string; name: string; email: string; password: string; role: string; apartment: string | null } | null {
  try {
    const url = process.env["DATABASE_URL"] ?? "file:./dev.db"
    const dbPath = url.startsWith("file:") ? url.slice(5) : url
    const db = new Database(dbPath)
    const user = db.prepare("SELECT id, name, email, password, role, apartment FROM User WHERE email = ?").get(email) as { id: string; name: string; email: string; password: string; role: string; apartment: string | null } | undefined
    db.close()
    return user ?? null
  } catch (err) {
    console.error("[auth] getUserByEmail error:", err)
    return null
  }
}

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

        const user = getUserByEmail(credentials.email as string)

        if (!user) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          apartment: user.apartment,
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
