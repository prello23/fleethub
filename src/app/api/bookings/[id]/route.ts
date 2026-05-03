import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notifyBookingCancelled } from "@/lib/notifications"

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, notifyPush: true, notifyEmail: true, pushSubscription: true } },
      room: { select: { name: true } },
    },
  })

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = booking.userId === session.user.id
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.booking.delete({ where: { id } })

  // Notify the booking owner (fire-and-forget)
  notifyBookingCancelled({
    id: booking.id,
    startTime: booking.startTime,
    endTime: booking.endTime,
    machineType: booking.machineType,
    machineNumber: booking.machineNumber,
    user: booking.user,
    room: booking.room,
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
