import { NextResponse } from "next/server"
import Database from "better-sqlite3"
import bcrypt from "bcryptjs"

// Test login directly — bypass NextAuth to diagnose issues
// GET /api/test-login?token=DEBUG_2025&email=elvarpa@gmail.com&password=Valdisgunnar2312
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get("token") !== "DEBUG_2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const email = searchParams.get("email") ?? "elvarpa@gmail.com"
  const password = searchParams.get("password") ?? "Valdisgunnar2312"

  try {
    const dbUrl = process.env["DATABASE_URL"] ?? ""
    const dbPath = dbUrl.replace("file:", "")
    const db = new Database(dbPath)

    // Get user data
    const user = db.prepare("SELECT id, email, role, password FROM User WHERE email = ?").get(email) as { id: string; email: string; role: string; password: string } | undefined
    
    const totalUsers = (db.prepare("SELECT COUNT(*) as cnt FROM User").get() as { cnt: number }).cnt
    db.close()

    if (!user) {
      return NextResponse.json({ 
        error: "User not found", email, dbPath, totalUsers 
      })
    }

    // Test bcrypt comparison (same as auth.ts)
    const valid = await bcrypt.compare(password, user.password)
    
    return NextResponse.json({
      dbPath,
      totalUsers,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        hashFirst20: user.password.substring(0, 20),
        hashLength: user.password.length,
      },
      passwordValid: valid,
      testedPassword: password,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
