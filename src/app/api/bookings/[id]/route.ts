import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const booking = await prisma.booking.findUnique({ where: { id } })

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = booking.userId === session.user.id
  const isAdmin = session.user.role === "ADMIN"

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.booking.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
