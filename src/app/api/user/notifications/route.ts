import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const update: { notifyPush?: boolean; notifyEmail?: boolean } = {}

  if (typeof body.notifyPush === "boolean") update.notifyPush = body.notifyPush
  if (typeof body.notifyEmail === "boolean") update.notifyEmail = body.notifyEmail

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true })
  }

  await prisma.user.update({ where: { id: session.user.id }, data: update })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { notifyPush: true, notifyEmail: true },
  })

  return NextResponse.json(user ?? { notifyPush: true, notifyEmail: true })
}
