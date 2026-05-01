import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { WashingMachine, Plus, Pencil, Clock, Waves } from "lucide-react"
import DeleteRoomButton from "@/components/DeleteRoomButton"

export default async function AdminRoomsPage() {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) redirect("/rooms")

  const rooms = await prisma.room.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { bookings: true } } },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Þvottahús</h1>
          <p className="text-gray-500 text-sm mt-1">Umsjón þvottahúsa</p>
        </div>
        <Link
          href="/admin/rooms/new"
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800"
        >
          <Plus size={16} />
          Nýtt þvottahús
        </Link>
      </div>

      {rooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <WashingMachine className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500 mb-4">Engin þvottahús skráð ennþá</p>
          <Link
            href="/admin/rooms/new"
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
          >
            Bæta við þvottahúsi
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <WashingMachine className="text-blue-700" size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{room.name}</h3>
                {room.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{room.description}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <WashingMachine size={11} className="text-blue-400" />
                    {room.washingMachines} þvottavélar
                  </span>
                  <span className="flex items-center gap-1">
                    <Waves size={11} className="text-teal-400" />
                    {room.dryers} þurrkarar
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {room.slotDurationMinutes} mín.
                  </span>
                  <span className="text-gray-400">
                    {room._count.bookings} bókanir
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/rooms/${room.id}`}
                  className="text-xs text-gray-500 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 border border-gray-200"
                >
                  Skoða
                </Link>
                <Link
                  href={`/admin/rooms/${room.id}`}
                  className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 border border-gray-200"
                >
                  <Pencil size={12} />
                  Breyta
                </Link>
                <DeleteRoomButton roomId={room.id} roomName={room.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
