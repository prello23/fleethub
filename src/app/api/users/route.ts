import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let users
  if (session.user.role === "SUPER_ADMIN") {
    users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, apartment: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })
  } else {
    const adminRooms = await prisma.room.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    })
    const roomIds = adminRooms.map((r) => r.id)
    const userRooms = await prisma.userRoom.findMany({
      where: { roomId: { in: roomIds } },
      select: { userId: true },
      distinct: ["userId"],
    })
    const userIds = userRooms.map((ur) => ur.userId)
    users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true, apartment: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })
  }

  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await auth()
  const body = await req.json()
  const { name, email, password, apartment, roomId } = body

  const isAdminCreating =
    session && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN")

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      apartment: apartment ?? null,
      ...(isAdminCreating && roomId ? { rooms: { create: { roomId } } } : {}),
    },
    select: { id: true, name: true, email: true, role: true, apartment: true },
  })

  return NextResponse.json(user, { status: 201 })
}
