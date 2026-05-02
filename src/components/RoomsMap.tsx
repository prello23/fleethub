"use client"

import { useEffect, useRef } from "react"

type MapRoom = {
  id: string
  name: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
}

type Props = {
  rooms: MapRoom[]
}

declare global {
  interface Window {
    L?: {
      map: (el: HTMLElement, opts: object) => LeafletMap
      tileLayer: (url: string, opts: object) => { addTo: (map: LeafletMap) => void }
      marker: (latlng: [number, number]) => LeafletMarker
    }
  }
}

type LeafletMap = {
  setView: (latlng: [number, number], zoom: number) => LeafletMap
  remove: () => void
}

type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker
  bindPopup: (content: string) => LeafletMarker
}

export default function RoomsMap({ rooms }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const initializedRef = useRef(false)

  const geoRooms = rooms.filter(
    (r) => r.latitude != null && r.longitude != null
  ) as (MapRoom & { latitude: number; longitude: number })[]

  useEffect(() => {
    if (initializedRef.current) return
    if (!containerRef.current) return

    function initMap() {
      if (!window.L || !containerRef.current) return
      if (initializedRef.current) return
      initializedRef.current = true

      const center: [number, number] =
        geoRooms.length > 0
          ? [geoRooms[0].latitude, geoRooms[0].longitude]
          : [64.1355, -21.8954] // Reykjavik default

      const map = window.L.map(containerRef.current, { scrollWheelZoom: false })
      mapRef.current = map
      map.setView(center, 13)

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      for (const room of geoRooms) {
        window.L.marker([room.latitude, room.longitude])
          .addTo(map)
          .bindPopup(`<strong>${room.name}</strong>${room.address ? `<br>${room.address}` : ""}`)
      }
    }

    if (window.L) {
      initMap()
      return
    }

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link")
      link.id = "leaflet-css"
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }

    // Load Leaflet JS
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script")
      script.id = "leaflet-js"
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.onload = initMap
      document.head.appendChild(script)
    } else {
      // Script tag exists but may not be loaded yet
      const existing = document.getElementById("leaflet-js") as HTMLScriptElement
      if (window.L) {
        initMap()
      } else {
        existing.addEventListener("load", initMap)
      }
    }

    return () => {
      // cleanup handled by initializedRef guard
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (geoRooms.length === 0) {
    return (
      <div className="h-80 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        No rooms with location data
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{ height: 320 }}
      className="rounded-2xl border border-gray-200 overflow-hidden"
    />
  )
}
