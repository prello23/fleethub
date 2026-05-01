import { NextResponse } from "next/server"
import { auth, signIn } from "@/auth"
import { prisma } from "@/lib/prisma"

// Super Admin can get a one-time token to view any user's data
export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId } = await req.json()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, apartment: true, createdAt: true, bookings: { include: { room: true }, orderBy: { startTime: "desc" }, take: 20 } },
  })

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(user)
}
