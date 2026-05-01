import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get("roomId")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const where: Record<string, unknown> = {}
  if (roomId) where.roomId = roomId
  if (from || to) {
    where.startTime = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    }
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, apartment: true } },
    },
    orderBy: { startTime: "asc" },
  })

  return NextResponse.json(bookings)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { roomId, machineType, machineNumber, startTime } = body

  const room = await prisma.room.findUnique({ where: { id: roomId } })
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 })

  const start = new Date(startTime)
  const end = new Date(start.getTime() + room.slotDurationMinutes * 60000)

  // Check for conflict
  const conflict = await prisma.booking.findFirst({
    where: {
      roomId,
      machineType,
      machineNumber,
      OR: [
        { startTime: { gte: start, lt: end } },
        { endTime: { gt: start, lte: end } },
        { startTime: { lte: start }, endTime: { gte: end } },
      ],
    },
  })

  if (conflict) {
    return NextResponse.json({ error: "Slot already booked" }, { status: 409 })
  }

  const booking = await prisma.booking.create({
    data: {
      roomId,
      userId: session.user.id,
      machineType,
      machineNumber,
      startTime: start,
      endTime: end,
    },
    include: {
      user: { select: { id: true, name: true, apartment: true } },
    },
  })

  return NextResponse.json(booking, { status: 201 })
}
