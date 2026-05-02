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
    let rooms: {
      id: string
      name: string
      description: string | null
      address: string | null
      latitude: number | null
      longitude: number | null
      washingMachines: number
      dryers: number
      slotDurationMinutes: number
    }[] = []

    try {
      rooms = await prisma.room.findMany({
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
    } catch (err) {
      console.error("[rooms/page] admin query failed:", err)
    }

    return <RoomsPageContent view="admin" rooms={rooms} />
  }

  // USER role — query may fail if DB schema is outdated (missing UserRoom/AccessRequest tables)
  let directoryRooms: DirectoryRoom[] = []

  try {
    const allRooms = await prisma.room.findMany({
      include: {
        users: { where: { userId }, select: { userId: true } },
        accessRequests: { where: { userId }, select: { status: true } },
      },
      orderBy: { name: "asc" },
    })

    directoryRooms = allRooms.map((room) => {
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
  } catch (err) {
    // DB schema outdated — fall back to plain room list with no access status
    console.error("[rooms/page] user query failed (schema outdated?):", err)
    try {
      const rooms = await prisma.room.findMany({ orderBy: { name: "asc" } })
      directoryRooms = rooms.map((room) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        address: (room as Record<string, unknown>).address as string | null ?? null,
        latitude: (room as Record<string, unknown>).latitude as number | null ?? null,
        longitude: (room as Record<string, unknown>).longitude as number | null ?? null,
        washingMachines: room.washingMachines,
        dryers: room.dryers,
        slotDurationMinutes: room.slotDurationMinutes,
        status: "available" as const,
      }))
    } catch (err2) {
      console.error("[rooms/page] fallback query also failed:", err2)
    }
  }

  return <RoomsPageContent view="user" directoryRooms={directoryRooms} />
}
