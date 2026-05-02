import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import RoomForm from "@/components/RoomForm"
import RoomUsersPanel from "@/components/RoomUsersPanel"
import RoomQRCode from "@/components/RoomQRCode"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const room = await prisma.room.findUnique({ where: { id }, select: { name: true } })
  return { title: room ? `Edit ${room.name} | Admin` : "Edit Room | Admin" }
}

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) redirect("/rooms")

  const { id } = await params
  const [room, assignedUsers, allUsers] = await Promise.all([
    prisma.room.findUnique({ where: { id } }),
    prisma.userRoom.findMany({
      where: { roomId: id },
      include: { user: { select: { id: true, name: true, email: true, apartment: true } } },
    }),
    session.user.role === "ADMIN"
      ? prisma.userRoom.findMany({
          where: { room: { ownerId: session.user.id } },
          select: { user: { select: { id: true, name: true, email: true, apartment: true } } },
          distinct: ["userId"],
        }).then((ur) => ur.map((r) => r.user))
      : prisma.user.findMany({
          where: { role: "USER" },
          select: { id: true, name: true, email: true, apartment: true },
          orderBy: { name: "asc" },
        }),
  ])

  if (!room) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/rooms" className="p-2 rounded-lg hover:bg-gray-200 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit room</h1>
          <p className="text-gray-500 text-sm">{room.name}</p>
        </div>
      </div>

      <RoomForm
        initial={{
          id: room.id,
          name: room.name,
          description: room.description ?? "",
          address: room.address ?? "",
          latitude: room.latitude ?? null,
          longitude: room.longitude ?? null,
          washingMachines: room.washingMachines,
          dryers: room.dryers,
          slotDurationMinutes: room.slotDurationMinutes,
          notifyMinutesBefore: room.notifyMinutesBefore,
          notifyMinutesBeforeEnd: room.notifyMinutesBeforeEnd,
          pricePerSlot: room.pricePerSlot,
        }}
      />

      <RoomUsersPanel
        roomId={room.id}
        assignedUsers={assignedUsers.map((u) => u.user)}
        allUsers={allUsers}
      />

      <RoomQRCode roomId={room.id} roomName={room.name} />
    </div>
  )
}
