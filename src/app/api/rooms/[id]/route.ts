import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = await prisma.room.findUnique({ where: { id } })
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(room)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const room = await prisma.room.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description ?? null,
      washingMachines: body.washingMachines,
      dryers: body.dryers,
      slotDurationMinutes: body.slotDurationMinutes,
      notifyMinutesBefore: body.notifyMinutesBefore,
      notifyMinutesBeforeEnd: body.notifyMinutesBeforeEnd,
    },
  })
  return NextResponse.json(room)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  await prisma.room.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
