"use client"

import Link from "next/link"
import { WashingMachine, Waves, Clock, ChevronRight } from "lucide-react"
import { useT } from "@/components/LanguageProvider"
import RoomDirectory from "@/components/RoomDirectory"
import type { DirectoryRoom } from "@/components/RoomDirectory"

type SimpleRoom = {
  id: string
  name: string
  description: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  washingMachines: number
  dryers: number
  slotDurationMinutes: number
}

type Props =
  | { view: "admin"; rooms: SimpleRoom[] }
  | { view: "user"; directoryRooms: DirectoryRoom[] }

export default function RoomsPageContent(props: Props) {
  const { t } = useT()

  if (props.view === "admin") {
    const { rooms } = props
    const dirRooms: DirectoryRoom[] = rooms.map((r) => ({ ...r, status: "assigned" as const }))

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t("rooms.title")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("rooms.selectToBook")}</p>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <WashingMachine className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">{t("rooms.noRoomsCreated")}</p>
            <Link
              href="/admin/rooms/new"
              className="mt-4 inline-block bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
            >
              {t("rooms.addRoom")}
            </Link>
          </div>
        ) : (
          <>
            <RoomDirectory rooms={dirRooms} />
            <div className="mt-6 text-center">
              <Link href="/admin/rooms/new" className="text-sm text-blue-700 hover:underline font-medium">
                + {t("rooms.addRoom")}
              </Link>
            </div>
          </>
        )}
      </div>
    )
  }

  // User view
  const { directoryRooms } = props
  const myRooms = directoryRooms.filter((r) => r.status === "assigned")

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("rooms.title")}</h1>
      </div>

      {myRooms.length > 0 ? (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t("rooms.myRooms")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {myRooms.map((room) => (
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
                    {room.washingMachines} {t("room.washers")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Waves size={14} className="text-teal-500" />
                    {room.dryers} {t("room.dryers")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    {room.slotDurationMinutes} {t("room.slots")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-medium">{t("rooms.noMyRooms")}</p>
          <p className="mt-0.5 text-amber-700">{t("rooms.noMyRoomsHint")}</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t("rooms.explore")}</h2>
        <RoomDirectory rooms={directoryRooms} />
      </div>
    </div>
  )
}
