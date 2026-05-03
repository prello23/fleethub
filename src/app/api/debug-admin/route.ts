import { NextResponse } from "next/server"
import Database from "better-sqlite3"

// Debug: check what's in DB for superadmin
// GET /api/debug-admin?token=DEBUG_2025
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get("token") !== "DEBUG_2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const dbUrl = process.env["DATABASE_URL"] ?? ""
    const dbPath = dbUrl.replace("file:", "")
    const db = new Database(dbPath)

    // Get user data (first 10 chars of hash only for security)
    const user = db.prepare("SELECT id, name, email, role, SUBSTR(password, 1, 20) as hashStart, LENGTH(password) as hashLen FROM User WHERE email = ?").get("elvarpa@gmail.com") as { id: string; name: string; email: string; role: string; hashStart: string; hashLen: number } | undefined
    
    // Count all users
    const count = db.prepare("SELECT COUNT(*) as cnt FROM User").get() as { cnt: number }
    
    db.close()
    
    return NextResponse.json({ 
      dbPath,
      user: user ?? null,
      totalUsers: count.cnt
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
