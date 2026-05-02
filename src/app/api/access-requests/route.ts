import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { roomId } = body

  if (!roomId) return NextResponse.json({ error: "roomId is required" }, { status: 400 })

  try {
    const request = await prisma.accessRequest.create({
      data: {
        userId: session.user.id,
        roomId,
        status: "PENDING",
      },
    })
    return NextResponse.json(request, { status: 201 })
  } catch (error: unknown) {
    // Unique constraint violation — already requested
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Request already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
