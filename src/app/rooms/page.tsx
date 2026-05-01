import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { WashingMachine, Waves, Clock, ChevronRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Laundry Rooms | Booking System" }

export default async function RoomsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { role, id: userId } = session.user
  const isAdminOrSuper = role === "ADMIN" || role === "SUPER_ADMIN"

  let rooms
  if (role === "SUPER_ADMIN") {
    rooms = await prisma.room.findMany({ orderBy: { name: "asc" } })
  } else if (role === "ADMIN") {
    rooms = await prisma.room.findMany({ where: { ownerId: userId }, orderBy: { name: "asc" } })
  } else {
    rooms = await prisma.room.findMany({
      where: { users: { some: { userId } } },
      orderBy: { name: "asc" },
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Laundry Rooms</h1>
        <p className="text-gray-500 text-sm mt-1">Select a room to book a slot</p>
      </div>

      {rooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <WashingMachine className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">
            {isAdminOrSuper
              ? "No laundry rooms created yet"
              : "You have not been assigned to any laundry room yet"}
          </p>
          {isAdminOrSuper && (
            <Link
              href="/admin/rooms/new"
              className="mt-4 inline-block bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
            >
              Add laundry room
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/rooms/${room.id}`}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <WashingMachine className="text-blue-700" size={16} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{room.name}</h2>
                  </div>
                  {room.description && (
                    <p className="text-sm text-gray-500 mt-1">{room.description}</p>
                  )}
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
              </div>

              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <WashingMachine size={14} className="text-blue-500" />
                  {room.washingMachines} washer{room.washingMachines !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Waves size={14} className="text-teal-500" />
                  {room.dryers} dryer{room.dryers !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" />
                  {room.slotDurationMinutes} min slots
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isAdminOrSuper && rooms.length > 0 && (
        <div className="mt-6 text-center">
          <Link href="/admin/rooms/new" className="text-sm text-blue-700 hover:underline font-medium">
            + Add laundry room
          </Link>
        </div>
      )}
    </div>
  )
}
