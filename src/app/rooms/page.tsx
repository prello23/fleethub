import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"
import RoomsPageContent from "@/components/RoomsPageContent"
import type { DirectoryRoom } from "@/components/RoomDirectory"

export const metadata: Metadata = { title: "Laundry Rooms | Booking System" }

export default async function RoomsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { role, id: userId } = session.user
  const isAdminOrSuper = role === "ADMIN" || role === "SUPER_ADMIN"

  if (isAdminOrSuper) {
    const rooms = await prisma.room.findMany({
      where: role === "SUPER_ADMIN" ? undefined : { ownerId: userId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        latitude: true,
        longitude: true,
        washingMachines: true,
        dryers: true,
        slotDurationMinutes: true,
      },
    })
    return <RoomsPageContent view="admin" rooms={rooms} />
  }

  // USER role
  const allRooms = await prisma.room.findMany({
    include: {
      users: { where: { userId }, select: { userId: true } },
      accessRequests: { where: { userId }, select: { status: true } },
    },
    orderBy: { name: "asc" },
  })

  const directoryRooms: DirectoryRoom[] = allRooms.map((room) => {
    let status: DirectoryRoom["status"] = "available"
    if (room.users.length > 0) {
      status = "assigned"
    } else if (room.accessRequests[0]?.status === "PENDING") {
      status = "pending"
    } else if (room.accessRequests[0]?.status === "APPROVED") {
      status = "assigned"
    } else if (room.accessRequests[0]?.status === "DENIED") {
      status = "denied"
    }
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      address: room.address,
      latitude: room.latitude,
      longitude: room.longitude,
      washingMachines: room.washingMachines,
      dryers: room.dryers,
      slotDurationMinutes: room.slotDurationMinutes,
      status,
    }
  })

  return <RoomsPageContent view="user" directoryRooms={directoryRooms} />
}
