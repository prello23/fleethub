import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, id: userId } = session.user

  let rooms
  if (role === "SUPER_ADMIN") {
    rooms = await prisma.room.findMany({ orderBy: { name: "asc" } })
  } else if (role === "ADMIN") {
    rooms = await prisma.room.findMany({
      where: { ownerId: userId },
      orderBy: { name: "asc" },
    })
  } else {
    rooms = await prisma.room.findMany({
      where: { users: { some: { userId } } },
      orderBy: { name: "asc" },
    })
  }

  return NextResponse.json(rooms)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const room = await prisma.room.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      address: body.address ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      washingMachines: body.washingMachines ?? 2,
      dryers: body.dryers ?? 1,
      slotDurationMinutes: body.slotDurationMinutes ?? 60,
      notifyMinutesBefore: body.notifyMinutesBefore ?? 30,
      notifyMinutesBeforeEnd: body.notifyMinutesBeforeEnd ?? 10,
      pricePerSlot: body.pricePerSlot ?? 0,
      ownerId: session.user.id,
    },
  })
  return NextResponse.json(room, { status: 201 })
}
