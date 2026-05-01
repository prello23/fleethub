import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: roomId } = await params
  const entries = await prisma.userRoom.findMany({
    where: { roomId },
    include: { user: { select: { id: true, name: true, email: true, apartment: true } } },
  })
  return NextResponse.json(entries.map((e) => e.user))
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: roomId } = await params
  const { userId } = await req.json()

  const existing = await prisma.userRoom.findUnique({ where: { userId_roomId: { userId, roomId } } })
  if (existing) return NextResponse.json({ ok: true })

  await prisma.userRoom.create({ data: { userId, roomId } })
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: roomId } = await params
  const { userId } = await req.json()
  await prisma.userRoom.deleteMany({ where: { userId, roomId } })
  return NextResponse.json({ ok: true })
}
