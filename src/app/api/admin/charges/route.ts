import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const where =
    session.user.role === "SUPER_ADMIN" ? {} : { room: { ownerId: session.user.id } }

  const charges = await prisma.charge.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, apartment: true } },
      room: { select: { id: true, name: true } },
      booking: { select: { id: true, startTime: true, endTime: true, machineType: true, machineNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(charges)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id, status } = await req.json()
  if (!["PENDING", "PAID", "WAIVED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const charge = await prisma.charge.update({
    where: { id },
    data: { status },
  })
  return NextResponse.json(charge)
}
