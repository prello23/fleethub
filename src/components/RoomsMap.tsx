"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { X, MapPin } from "lucide-react"
import { useT } from "@/components/LanguageProvider"
import AccessRequestButton from "@/components/AccessRequestButton"

export type MapRoom = {
  id: string
  name: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  status?: "assigned" | "pending" | "available" | "denied"
}

// File-local Leaflet types — avoids global Window.L declaration conflicts
type LMap = {
  setView: (latlng: [number, number], zoom: number) => LMap
  remove: () => void
}
type LMarker = {
  addTo: (map: LMap) => LMarker
  on: (event: string, fn: () => void) => LMarker
}
type LeafletLib = {
  map: (el: HTMLElement, opts: object) => LMap
  tileLayer: (url: string, opts: object) => { addTo: (map: LMap) => void }
  marker: (latlng: [number, number]) => LMarker
}
function getL(): LeafletLib | undefined {
  return (window as unknown as { L?: LeafletLib }).L
}

export default function RoomsMap({ rooms }: { rooms: MapRoom[] }) {
  const { t } = useT()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LMap | null>(null)
  const initializedRef = useRef(false)
  const [selectedRoom, setSelectedRoom] = useState<MapRoom | null>(null)

  // Stable ref so Leaflet click handlers always call the latest setter
  const setSelectedRef = useRef(setSelectedRoom)
  setSelectedRef.current = setSelectedRoom

  const geoRooms = rooms.filter(
    (r) => r.latitude != null && r.longitude != null
  ) as (MapRoom & { latitude: number; longitude: number })[]

  useEffect(() => {
    if (initializedRef.current) return
    if (!containerRef.current) return

    function initMap() {
      const L = getL()
      if (!L || !containerRef.current) return
      if (initializedRef.current) return
      initializedRef.current = true

      const center: [number, number] =
        geoRooms.length > 0
          ? [geoRooms[0].latitude, geoRooms[0].longitude]
          : [64.1355, -21.8954]

      const map = L.map(containerRef.current, { scrollWheelZoom: false })
      mapRef.current = map
      map.setView(center, 13)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      for (const room of geoRooms) {
        const r = room
        L.marker([room.latitude, room.longitude])
          .addTo(map)
          .on("click", () => setSelectedRef.current(r))
      }
    }

    const L = getL()
    if (L) { initMap(); return }

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link")
      link.id = "leaflet-css"
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }

    const existing = document.getElementById("leaflet-js") as HTMLScriptElement | null
    if (!existing) {
      const script = document.createElement("script")
      script.id = "leaflet-js"
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.onload = initMap
      document.head.appendChild(script)
    } else {
      if (getL()) initMap()
      else existing.addEventListener("load", initMap)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (geoRooms.length === 0) {
    return (
      <div className="h-80 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        {t("rooms.noLocationData")}
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl border border-gray-200 overflow-hidden">
      <div ref={containerRef} style={{ height: 320 }} />

      {/* Room action panel — slides up when marker is clicked */}
      {selectedRoom && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-[1000]">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{selectedRoom.name}</p>
              {selectedRoom.address && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="flex-shrink-0" />
                  {selectedRoom.address}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedRoom(null)}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex gap-2">
            {selectedRoom.status === "assigned" && (
              <Link
                href={`/rooms/${selectedRoom.id}`}
                className="flex-1 text-center bg-blue-700 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-800"
              >
                {t("rooms.hasAccess")}
              </Link>
            )}
            {selectedRoom.status === "available" && (
              <AccessRequestButton roomId={selectedRoom.id} />
            )}
            {selectedRoom.status === "pending" && (
              <span className="flex-1 text-center border border-amber-300 text-amber-700 bg-amber-50 py-2 rounded-xl text-sm font-medium">
                {t("rooms.pendingApproval")}
              </span>
            )}
            {selectedRoom.status === "denied" && (
              <span className="flex-1 text-center border border-gray-300 text-gray-500 bg-gray-50 py-2 rounded-xl text-sm font-medium">
                {t("access.denied")}
              </span>
            )}
            {/* No status = admin view, no action needed */}
          </div>
        </div>
      )}
    </div>
  )
}
