import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getServerT } from "@/lib/server-i18n"
import Link from "next/link"
import { WashingMachine, Waves, Clock, Settings, ArrowLeft } from "lucide-react"
import BookingCalendar from "@/components/BookingCalendar"
import type { Metadata } from "next"

type RoomRow = {
  id: string; name: string; description: string | null
  washingMachines: number; dryers: number; slotDurationMinutes: number
  pricePerSlot: number; ownerId: string | null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const room = db.prepare(`SELECT name FROM "Room" WHERE id = ?`).get(id) as { name: string } | undefined
  return { title: room ? `${room.name} | Laundry` : "Laundry Room | Laundry" }
}

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")

  const { t } = await getServerT()
  const { id } = await params
  const room = db.prepare(
    `SELECT id, name, description, washingMachines, dryers, slotDurationMinutes, pricePerSlot, ownerId FROM "Room" WHERE id = ?`
  ).get(id) as RoomRow | undefined
  if (!room) notFound()

  const isAdminOrSuper = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/rooms" className="p-2 rounded-lg hover:bg-gray-200 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <WashingMachine className="text-blue-600" size={22} />
            <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
            {isAdminOrSuper && (
              <Link
                href={`/admin/rooms/${room.id}`}
                className="p-2.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 touch-manipulation"
                title="Edit settings"
              >
                <Settings size={18} />
              </Link>
            )}
          </div>
          {room.description && (
            <p className="text-gray-500 text-sm mt-0.5">{room.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-sm">
          <WashingMachine size={16} className="text-blue-500" />
          <span className="text-gray-600">{room.washingMachines} {t("room.washingMachines")}</span>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-sm">
          <Waves size={16} className="text-teal-500" />
          <span className="text-gray-600">{room.dryers} {t("room.dryers")}</span>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-sm">
          <Clock size={16} className="text-gray-400" />
          <span className="text-gray-600">{room.slotDurationMinutes} {t("room.slots")}</span>
        </div>
      </div>

      <BookingCalendar
        room={{
          id: room.id,
          name: room.name,
          washingMachines: room.washingMachines,
          dryers: room.dryers,
          slotDurationMinutes: room.slotDurationMinutes,
        }}
        currentUserId={session.user.id}
        currentUserName={session.user.name ?? ""}
      />
    </div>
  )
}
