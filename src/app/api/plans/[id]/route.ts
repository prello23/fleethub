import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const plan = await prisma.plan.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description ?? null,
      price: parseFloat(body.price),
      currency: body.currency,
      intervalDays: body.intervalDays,
      maxRooms: body.maxRooms,
      active: body.active,
    },
  })
  return NextResponse.json(plan)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  await prisma.plan.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
