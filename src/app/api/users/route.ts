import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, apartment: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, password, apartment } = body

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, apartment: apartment ?? null },
    select: { id: true, name: true, email: true, role: true, apartment: true },
  })

  return NextResponse.json(user, { status: 201 })
}
