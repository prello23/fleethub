import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { notifyBookingConfirmed } from "@/lib/notifications"
import { randomUUID } from "crypto"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get("roomId")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const conditions: string[] = []
  const params: unknown[] = []

  if (roomId) { conditions.push(`b.roomId = ?`); params.push(roomId) }
  if (from) { conditions.push(`b.startTime >= ?`); params.push(from) }
  if (to) { conditions.push(`b.startTime <= ?`); params.push(to) }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : ""
  const rows = db.prepare(
    `SELECT b.id, b.roomId, b.userId, b.machineType, b.machineNumber,
     b.startTime, b.endTime, b.notifiedStart, b.notifiedEnd, b.createdAt,
     u.id as uId, u.name as uName, u.apartment as uApartment
     FROM "Booking" b JOIN "User" u ON b.userId = u.id ${where} ORDER BY b.startTime ASC`
  ).all(...params) as Record<string, unknown>[]

  const bookings = rows.map(r => ({
    id: r.id, roomId: r.roomId, userId: r.userId,
    machineType: r.machineType, machineNumber: r.machineNumber,
    startTime: r.startTime, endTime: r.endTime,
    notifiedStart: !!r.notifiedStart, notifiedEnd: !!r.notifiedEnd,
    createdAt: r.createdAt,
    user: { id: r.uId, name: r.uName, apartment: r.uApartment }
  }))

  return NextResponse.json(bookings)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { roomId, machineType, machineNumber, startTime } = body

  const room = db.prepare(
    `SELECT id, name, slotDurationMinutes, pricePerSlot FROM "Room" WHERE id = ?`
  ).get(roomId) as { id: string; name: string; slotDurationMinutes: number; pricePerSlot: number } | undefined
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 })

  const start = new Date(startTime)
  const end = new Date(start.getTime() + room.slotDurationMinutes * 60000)
  const startISO = start.toISOString()
  const endISO = end.toISOString()

  // Conflict check
  const conflict = db.prepare(
    `SELECT id FROM "Booking"
     WHERE roomId = ? AND machineType = ? AND machineNumber = ?
     AND ((startTime >= ? AND startTime < ?) OR (endTime > ? AND endTime <= ?) OR (startTime <= ? AND endTime >= ?))`
  ).get(roomId, machineType, machineNumber, startISO, endISO, startISO, endISO, startISO, endISO)
  if (conflict) return NextResponse.json({ error: "Slot already booked" }, { status: 409 })

  const bookingId = randomUUID()
  const now = new Date().toISOString()

  db.prepare(
    `INSERT INTO "Booking" (id, roomId, userId, machineType, machineNumber, startTime, endTime, notifiedStart, notifiedEnd, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`
  ).run(bookingId, roomId, session.user.id, machineType, machineNumber, startISO, endISO, now)

  if (room.pricePerSlot > 0) {
    db.prepare(
      `INSERT INTO "Charge" (id, userId, roomId, bookingId, amount, currency, status, createdAt)
       VALUES (?, ?, ?, ?, ?, 'ISK', 'PENDING', ?)`
    ).run(randomUUID(), session.user.id, roomId, bookingId, room.pricePerSlot, now)
  }

  const userRow = db.prepare(
    `SELECT id, name, email, notifyPush, notifyEmail, pushSubscription FROM "User" WHERE id = ?`
  ).get(session.user.id) as { id: string; name: string; email: string; notifyPush: number; notifyEmail: number; pushSubscription: string | null } | undefined

  // Fire notifications asynchronously — don't block the response
  if (userRow) {
    Promise.resolve().then(async () => {
      await notifyBookingConfirmed({
        id: bookingId, startTime: start, endTime: end, machineType, machineNumber,
        user: { ...userRow, notifyPush: !!userRow.notifyPush, notifyEmail: !!userRow.notifyEmail },
        room: { name: room.name }
      })
    }).catch(() => {})
  }

  const booking = { id: bookingId, roomId, userId: session.user.id, machineType, machineNumber, startTime: startISO, endTime: endISO, createdAt: now, user: userRow ? { id: userRow.id, name: userRow.name, apartment: null } : null }
  return NextResponse.json(booking, { status: 201 })
}
