import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      role: body.role,
      apartment: body.apartment ?? null,
    },
    select: { id: true, name: true, email: true, role: true, apartment: true },
  })
  return NextResponse.json(user)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
