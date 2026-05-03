import { NextResponse } from "next/server"
import Database from "better-sqlite3"
import path from "path"

// Emergency admin password reset
// Usage: GET /api/fix-admin?token=RESET_2025
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get("token") !== "RESET_2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const dbUrl = process.env["DATABASE_URL"] ?? ""
    const dbPath = dbUrl.replace("file:", "")
    const db = new Database(dbPath)

    // Pre-computed bcrypt hash for "Valdisgunnar2312" (rounds=10) - verified correct
    const HASH = "$2b$10$.Z..LC9HHP86fEyZnKJBVOeWx4hCPBw6acbLWX45WhMU2ec2MbPVG"
    
    // Check if superadmin exists
    const existing = db.prepare("SELECT id, email, role FROM User WHERE email = ?").get("elvarpa@gmail.com") as { id: string; email: string; role: string } | undefined
    
    if (existing) {
      // Update password and ensure SUPER_ADMIN role
      db.prepare("UPDATE User SET password = ?, role = 'SUPER_ADMIN' WHERE email = ?").run(HASH, "elvarpa@gmail.com")
      db.close()
      return NextResponse.json({ 
        ok: true, 
        message: "Superadmin password reset to Valdisgunnar2312",
        email: "elvarpa@gmail.com",
        role: "SUPER_ADMIN"
      })
    } else {
      // Create superadmin if not exists
      const { v4: uuidv4 } = await import("uuid")
      const id = uuidv4()
      db.prepare("INSERT INTO User (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        id, "Elvar Páll Sævarsson", "elvarpa@gmail.com", HASH, "SUPER_ADMIN",
        new Date().toISOString(), new Date().toISOString()
      )
      db.close()
      return NextResponse.json({ 
        ok: true, 
        message: "Superadmin created with password Valdisgunnar2312",
        email: "elvarpa@gmail.com",
        role: "SUPER_ADMIN"
      })
    }
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
