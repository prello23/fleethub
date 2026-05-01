import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } })
  return NextResponse.json(plans)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const plan = await prisma.plan.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      price: parseFloat(body.price),
      currency: body.currency ?? "ISK",
      intervalDays: body.intervalDays ?? 30,
      maxRooms: body.maxRooms ?? 1,
      active: body.active ?? true,
    },
  })
  return NextResponse.json(plan, { status: 201 })
}
