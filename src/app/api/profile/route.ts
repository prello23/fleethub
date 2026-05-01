import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { apartment, currentPassword, newPassword } = body

  const updateData: { apartment?: string | null; password?: string } = {}

  if ("apartment" in body) {
    updateData.apartment = apartment ?? null
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password required" }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } })
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return NextResponse.json({ error: "Wrong password" }, { status: 400 })

    updateData.password = await bcrypt.hash(newPassword, 12)
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ ok: true })
  }

  await prisma.user.update({ where: { id: session.user.id }, data: updateData })
  return NextResponse.json({ ok: true })
}
