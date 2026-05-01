import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const rooms = await prisma.room.findMany({ orderBy: { name: "asc" } })
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
      washingMachines: body.washingMachines ?? 2,
      dryers: body.dryers ?? 1,
      slotDurationMinutes: body.slotDurationMinutes ?? 60,
      notifyMinutesBefore: body.notifyMinutesBefore ?? 30,
      notifyMinutesBeforeEnd: body.notifyMinutesBeforeEnd ?? 10,
    },
  })
  return NextResponse.json(room, { status: 201 })
}
