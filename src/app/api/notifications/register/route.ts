import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { playerId } = await req.json()
  if (!playerId) return NextResponse.json({ error: "playerId required" }, { status: 400 })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { oneSignalPlayerId: playerId },
  })

  return NextResponse.json({ ok: true })
}
