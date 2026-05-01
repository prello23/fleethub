import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const subs = await prisma.subscription.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(subs)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { userId, planId, status, endDate, notes } = body

  const existing = await prisma.subscription.findUnique({ where: { userId } })
  let sub
  if (existing) {
    sub = await prisma.subscription.update({
      where: { userId },
      data: { planId, status, endDate: endDate ? new Date(endDate) : null, notes },
      include: { user: { select: { id: true, name: true, email: true } }, plan: true },
    })
  } else {
    sub = await prisma.subscription.create({
      data: { userId, planId, status, endDate: endDate ? new Date(endDate) : null, notes },
      include: { user: { select: { id: true, name: true, email: true } }, plan: true },
    })
  }

  return NextResponse.json(sub, { status: 201 })
}
