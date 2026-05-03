import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get("token") !== "SEED_SECRET_2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results: string[] = []

  // Pre-computed bcrypt hashes (rounds=10) — instant, no bcrypt delay
  const SUPERADMIN_HASH = "$2b$10$e.Dj7g7.D9YZDpcBVDj3BO9SehsHoMg0RXjFPn3ZbB0gSS4d/woUS"
  const DEMO_HASH = "$2b$10$e.Dj7g7.D9YZDpcBVDj3BO9SehsHoMg0RXjFPn3ZbB0gSS4d/woUS"
  const now = new Date().toISOString()

  // Super admin — upsert
  const existing = db.prepare(`SELECT id FROM "User" WHERE email = ?`).get("elvarpa@gmail.com") as { id: string } | undefined
  if (existing) {
    db.prepare(`UPDATE "User" SET password = ?, name = ?, role = ? WHERE email = ?`).run(
      "$2b$10$Vp0EMI6P5PcRAbX0dXlIbumqjJmgZtfXNJzOJjrOiS8BrPBCuvfxW", "Elvar Páll Sævarsson", "SUPER_ADMIN", "elvarpa@gmail.com"
    )
    results.push("superadmin: elvarpa@gmail.com (updated, pw=Valdisgunnar2312)")
  } else {
    db.prepare(`INSERT INTO "User" (id, name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)`).run(
      randomUUID(), "Elvar Páll Sævarsson", "elvarpa@gmail.com",
      "$2b$10$Vp0EMI6P5PcRAbX0dXlIbumqjJmgZtfXNJzOJjrOiS8BrPBCuvfxW",
      "SUPER_ADMIN", now
    )
    results.push("superadmin: elvarpa@gmail.com (created, pw=Valdisgunnar2312)")
  }

  // Demo room
  let room = db.prepare(`SELECT id FROM "Room" WHERE name = ?`).get("Þvottahús 1") as { id: string } | undefined
  if (!room) {
    const roomId = randomUUID()
    db.prepare(
      `INSERT INTO "Room" (id, name, description, address, washingMachines, dryers, slotDurationMinutes, pricePerSlot, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(roomId, "Þvottahús 1", "Aðalþvottahús hússins", "Reykjavík", 2, 1, 60, 0, now)
    room = { id: roomId }
    results.push("room: Þvottahús 1 (created)")
  } else {
    results.push("room: Þvottahús 1 (already exists)")
  }

  // Demo users
  const demoUsers = [
    { name: "Jón Jónsson", email: "jon@laundry.is", role: "USER", apartment: "1A" },
    { name: "Anna Sigurðardóttir", email: "anna@laundry.is", role: "USER", apartment: "2B" },
    { name: "Gunnar Björnsson", email: "gunnar@laundry.is", role: "ADMIN", apartment: "3C" },
    { name: "Sigríður Eiríksdóttir", email: "sigridur@laundry.is", role: "ADMIN", apartment: "4D" },
    { name: "Magnús Pétursson", email: "magnus@laundry.is", role: "ADMIN", apartment: "5E" },
  ]

  for (const u of demoUsers) {
    const exists = db.prepare(`SELECT id FROM "User" WHERE email = ?`).get(u.email) as { id: string } | undefined
    if (!exists) {
      const userId = randomUUID()
      db.prepare(
        `INSERT INTO "User" (id, name, email, password, role, apartment, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(userId, u.name, u.email, DEMO_HASH, u.role, u.apartment, now)
      // Assign to room
      db.prepare(`INSERT OR IGNORE INTO "UserRoom" (userId, roomId, createdAt) VALUES (?, ?, ?)`).run(userId, room!.id, now)
      results.push(`user: ${u.email} (created, assigned to Þvottahús 1)`)
    } else {
      results.push(`user: ${u.email} (already exists)`)
    }
  }

  return NextResponse.json({
    success: true, results,
    passwords: { superadmin: "Valdisgunnar2312", demo: "Laundry123!" },
    note: "All seed users use direct SQLite — no Prisma"
  })
}
