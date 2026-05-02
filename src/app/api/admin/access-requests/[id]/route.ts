import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/admin/access-requests/[id]">
) {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await ctx.params
  const body = await req.json()
  const { action } = body as { action: "approve" | "deny" }

  if (action !== "approve" && action !== "deny") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const accessRequest = await prisma.accessRequest.findUnique({
    where: { id },
    include: { room: true },
  })

  if (!accessRequest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // ADMIN can only manage requests for their own rooms
  if (session.user.role === "ADMIN" && accessRequest.room.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (action === "approve") {
    const [updated] = await prisma.$transaction([
      prisma.accessRequest.update({
        where: { id },
        data: { status: "APPROVED" },
        include: {
          user: { select: { id: true, name: true, email: true, apartment: true } },
          room: { select: { id: true, name: true } },
        },
      }),
      prisma.userRoom.upsert({
        where: { userId_roomId: { userId: accessRequest.userId, roomId: accessRequest.roomId } },
        create: { userId: accessRequest.userId, roomId: accessRequest.roomId },
        update: {},
      }),
    ])
    return NextResponse.json(updated)
  } else {
    const updated = await prisma.accessRequest.update({
      where: { id },
      data: { status: "DENIED" },
      include: {
        user: { select: { id: true, name: true, email: true, apartment: true } },
        room: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(updated)
  }
}
