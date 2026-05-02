"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, MapPin } from "lucide-react"
import { useT } from "@/components/LanguageProvider"

type Room = {
  id?: string
  name: string
  description: string
  address: string
  latitude: number | null
  longitude: number | null
  washingMachines: number
  dryers: number
  slotDurationMinutes: number
  notifyMinutesBefore: number
  notifyMinutesBeforeEnd: number
  pricePerSlot: number
}

// --- Leaflet types (file-local, avoids global type conflicts) ---
type LLatLng = { lat: number; lng: number }
type LMap = {
  setView: (latlng: [number, number], zoom: number) => LMap
  remove: () => void
  on: (event: string, fn: (e: { latlng: LLatLng }) => void) => LMap
}
type LMarker = {
  addTo: (map: LMap) => LMarker
  setLatLng: (latlng: [number, number]) => LMarker
  remove: () => void
  on: (event: string, fn: (e: { target: { getLatLng: () => LLatLng } }) => void) => LMarker
}
type LeafletLib = {
  map: (el: HTMLElement, opts: object) => LMap
  tileLayer: (url: string, opts: object) => { addTo: (map: LMap) => void }
  marker: (latlng: [number, number], opts?: object) => LMarker
}

function getL(): LeafletLib | undefined {
  return (window as unknown as { L?: LeafletLib }).L
}

// --- Click-on-map location picker ---
function LocationMapPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | null
  lng: number | null
  onChange: (lat: number | null, lng: number | null) => void
}) {
  const { t } = useT()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LMap | null>(null)
  const markerRef = useRef<LMarker | null>(null)
  const readyRef = useRef(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (readyRef.current || !containerRef.current) return

    function initMap() {
      const L = getL()
      if (!L || !containerRef.current || readyRef.current) return
      readyRef.current = true

      const center: [number, number] =
        lat != null && lng != null ? [lat, lng] : [64.1355, -21.8954]
      const zoom = lat != null && lng != null ? 15 : 11

      const map = L.map(containerRef.current, { scrollWheelZoom: false })
      mapRef.current = map
      map.setView(center, zoom)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      if (lat != null && lng != null) {
        markerRef.current = L.marker([lat, lng], { draggable: true })
          .addTo(map)
          .on("dragend", (e) => {
            const pos = e.target.getLatLng()
            onChangeRef.current(pos.lat, pos.lng)
          })
      }

      map.on("click", (e) => {
        const { lat: newLat, lng: newLng } = e.latlng
        onChangeRef.current(newLat, newLng)
        const L2 = getL()
        if (!L2 || !mapRef.current) return
        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng])
        } else {
          markerRef.current = L2.marker([newLat, newLng], { draggable: true })
            .addTo(mapRef.current)
            .on("dragend", (ev) => {
              const pos = ev.target.getLatLng()
              onChangeRef.current(pos.lat, pos.lng)
            })
        }
      })
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
      existing.addEventListener("load", initMap)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
        readyRef.current = false
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync marker when lat/lng change from number inputs
  useEffect(() => {
    if (!readyRef.current || !mapRef.current) return
    const L = getL()
    if (!L) return
    if (lat != null && lng != null) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true })
          .addTo(mapRef.current)
          .on("dragend", (e) => {
            const pos = e.target.getLatLng()
            onChangeRef.current(pos.lat, pos.lng)
          })
      }
    } else {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [lat, lng])

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        style={{ height: 280 }}
        className="rounded-xl border border-gray-200 overflow-hidden cursor-crosshair"
      />
      <div className="flex items-center justify-between text-xs text-gray-500">
        {lat != null && lng != null ? (
          <>
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-blue-500" />
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
            <button
              type="button"
              onClick={() => onChange(null, null)}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              {t("rooms.clearLocation")}
            </button>
          </>
        ) : (
          <span>{t("rooms.mapPickLocation")}</span>
        )}
      </div>
    </div>
  )
}

// --- Main form ---
export default function RoomForm({ initial }: { initial?: Room }) {
  const router = useRouter()
  const [form, setForm] = useState<Room>(
    initial ?? {
      name: "",
      description: "",
      address: "",
      latitude: null,
      longitude: null,
      washingMachines: 2,
      dryers: 1,
      slotDurationMinutes: 60,
      notifyMinutesBefore: 30,
      notifyMinutesBeforeEnd: 10,
      pricePerSlot: 0,
    }
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function set<K extends keyof Room>(key: K, value: Room[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const url = form.id ? `/api/rooms/${form.id}` : "/api/rooms"
    const method = form.id ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Something went wrong")
      setLoading(false)
      return
    }

    router.push("/admin/rooms")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Basic info</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            placeholder="e.g. Basement laundry room"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            placeholder="e.g. Located in the basement near entrance A"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Equipment</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Washing machines</label>
            <input
              type="number" min={1} max={20}
              value={form.washingMachines}
              onChange={(e) => set("washingMachines", parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dryers</label>
            <input
              type="number" min={0} max={20}
              value={form.dryers}
              onChange={(e) => set("dryers", parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slot duration (minutes)</label>
          <div className="flex flex-wrap gap-2">
            {[30, 45, 60, 90, 120].map((m) => (
              <button
                key={m} type="button"
                onClick={() => set("slotDurationMinutes", m)}
                className={`px-4 py-2 rounded-lg text-sm border font-medium transition-all ${
                  form.slotDurationMinutes === m
                    ? "bg-blue-700 text-white border-blue-700"
                    : "border-gray-200 text-gray-700 hover:border-blue-300"
                }`}
              >
                {m} min
              </button>
            ))}
            <input
              type="number" min={15} max={240}
              value={form.slotDurationMinutes}
              onChange={(e) => set("slotDurationMinutes", parseInt(e.target.value))}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Custom"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Pricing</h2>
        <p className="text-sm text-gray-500">Set a price per booking slot. Leave at 0 for free usage.</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price per slot (ISK)</label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} step={100}
              value={form.pricePerSlot}
              onChange={(e) => set("pricePerSlot", parseFloat(e.target.value) || 0)}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">ISK</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Location</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="e.g. 123 Main Street, Reykjavik"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <LocationMapPicker
          lat={form.latitude}
          lng={form.longitude}
          onChange={(lat, lng) => {
            set("latitude", lat)
            set("longitude", lng)
          }}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              step={0.00001}
              value={form.latitude ?? ""}
              onChange={(e) => set("latitude", e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="e.g. 64.13550"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              step={0.00001}
              value={form.longitude ?? ""}
              onChange={(e) => set("longitude", e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="e.g. -21.89540"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Notifications</h2>
        <p className="text-sm text-gray-500">When to notify users before their slot starts and ends.</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minutes before start</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min={1} max={120}
                value={form.notifyMinutesBefore}
                onChange={(e) => set("notifyMinutesBefore", parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">min</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minutes before end</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min={1} max={60}
                value={form.notifyMinutesBeforeEnd}
                onChange={(e) => set("notifyMinutesBeforeEnd", parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">min</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-60">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {form.id ? "Save changes" : "Create room"}
        </button>
      </div>
    </form>
  )
}
