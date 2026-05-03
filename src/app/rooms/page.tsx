import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import type { Metadata } from "next"
import RoomsPageContent from "@/components/RoomsPageContent"
import type { DirectoryRoom } from "@/components/RoomDirectory"

export const metadata: Metadata = { title: "Laundry Rooms | Booking System" }

type RoomRow = {
  id: string; name: string; description: string | null; address: string | null
  latitude: number | null; longitude: number | null
  washingMachines: number; dryers: number; slotDurationMinutes: number
}

export default async function RoomsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { role, id: userId } = session.user
  const isAdminOrSuper = role === "ADMIN" || role === "SUPER_ADMIN"

  if (isAdminOrSuper) {
    let rooms: RoomRow[] = []
    try {
      if (role === "SUPER_ADMIN") {
        rooms = db.prepare(
          `SELECT id, name, description, address, latitude, longitude,
           washingMachines, dryers, slotDurationMinutes FROM "Room" ORDER BY name ASC`
        ).all() as RoomRow[]
      } else {
        rooms = db.prepare(
          `SELECT id, name, description, address, latitude, longitude,
           washingMachines, dryers, slotDurationMinutes FROM "Room" WHERE ownerId = ? ORDER BY name ASC`
        ).all(userId) as RoomRow[]
      }
    } catch (err) {
      console.error("[rooms/page] admin query failed:", err)
    }
    return <RoomsPageContent view="admin" rooms={rooms} />
  }

  // USER role — direct SQL, no Prisma
  let directoryRooms: DirectoryRoom[] = []
  try {
    const rooms = db.prepare(
      `SELECT id, name, description, address, latitude, longitude,
       washingMachines, dryers, slotDurationMinutes FROM "Room" ORDER BY name ASC`
    ).all() as RoomRow[]

    const userRoomRows = db.prepare(
      `SELECT roomId FROM "UserRoom" WHERE userId = ?`
    ).all(userId) as { roomId: string }[]
    const assignedRooms = new Set(userRoomRows.map(r => r.roomId))

    const accessRows = db.prepare(
      `SELECT roomId, status FROM "AccessRequest" WHERE userId = ?`
    ).all(userId) as { roomId: string; status: string }[]
    const accessMap = new Map(accessRows.map(r => [r.roomId, r.status]))

    directoryRooms = rooms.map((room) => {
      let status: DirectoryRoom["status"] = "available"
      if (assignedRooms.has(room.id)) {
        status = "assigned"
      } else {
        const reqStatus = accessMap.get(room.id)
        if (reqStatus === "PENDING") status = "pending"
        else if (reqStatus === "APPROVED") status = "assigned"
        else if (reqStatus === "DENIED") status = "denied"
      }
      return { ...room, status }
    })
  } catch (err) {
    console.error("[rooms/page] user query failed:", err)
  }

  return <RoomsPageContent view="user" directoryRooms={directoryRooms} />
}
