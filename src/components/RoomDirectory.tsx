"use client"

import { useState } from "react"
import Link from "next/link"
import { WashingMachine, Waves, Clock, MapPin, Map, List } from "lucide-react"
import { useT } from "@/components/LanguageProvider"
import AccessRequestButton from "@/components/AccessRequestButton"
import RoomsMap from "@/components/RoomsMap"

export type DirectoryRoom = {
  id: string
  name: string
  description: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  washingMachines: number
  dryers: number
  slotDurationMinutes: number
  status: "assigned" | "pending" | "available" | "denied"
}

type Props = {
  rooms: DirectoryRoom[]
}

export default function RoomDirectory({ rooms }: Props) {
  const { t } = useT()
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"list" | "map">("list")

  const filtered = rooms.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      r.name.toLowerCase().includes(q) ||
      (r.address?.toLowerCase().includes(q) ?? false)
    )
  })

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("rooms.search")}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "list" ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List size={14} />
            {t("rooms.listView")}
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "map" ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Map size={14} />
            {t("rooms.mapView")}
          </button>
        </div>
      </div>

      {/* Map view */}
      {view === "map" && (
        <RoomsMap rooms={filtered} />
      )}

      {/* List view */}
      {view === "list" && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">{t("rooms.noResults")}</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function RoomCard({ room }: { room: DirectoryRoom }) {
  const { t } = useT()

  const statusBadge = () => {
    switch (room.status) {
      case "assigned":
        return (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            {t("rooms.hasAccess")}
          </span>
        )
      case "pending":
        return (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            {t("access.pending")}
          </span>
        )
      case "denied":
        return (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            {t("access.denied2")}
          </span>
        )
      default:
        return null
    }
  }

  const actionButton = () => {
    switch (room.status) {
      case "assigned":
        return (
          <Link
            href={`/rooms/${room.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-700 text-white hover:bg-blue-800 py-2 rounded-xl text-sm font-medium"
          >
            {t("rooms.hasAccess")}
          </Link>
        )
      case "pending":
        return (
          <span className="flex-1 flex items-center justify-center gap-2 border border-amber-300 text-amber-700 bg-amber-50 py-2 rounded-xl text-sm font-medium">
            {t("rooms.pendingApproval")}
          </span>
        )
      case "denied":
        return (
          <span className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-500 bg-gray-50 py-2 rounded-xl text-sm font-medium">
            {t("access.denied")}
          </span>
        )
      default:
        return <AccessRequestButton roomId={room.id} />
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <WashingMachine className="text-blue-700" size={16} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{room.name}</h2>
        </div>
        <div>{statusBadge()}</div>
      </div>

      {room.description && (
        <p className="text-sm text-gray-500">{room.description}</p>
      )}

      {room.address && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin size={13} className="text-gray-400 flex-shrink-0" />
          <span>{room.address}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
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

      <div className="flex gap-2 pt-1">
        {actionButton()}
      </div>
    </div>
  )
}
