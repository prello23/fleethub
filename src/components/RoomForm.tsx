"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"

type Room = {
  id?: string
  name: string
  description: string
  washingMachines: number
  dryers: number
  slotDurationMinutes: number
  notifyMinutesBefore: number
  notifyMinutesBeforeEnd: number
}

export default function RoomForm({ initial }: { initial?: Room }) {
  const router = useRouter()
  const [form, setForm] = useState<Room>(
    initial ?? {
      name: "",
      description: "",
      washingMachines: 2,
      dryers: 1,
      slotDurationMinutes: 60,
      notifyMinutesBefore: 30,
      notifyMinutesBeforeEnd: 10,
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
      setError(data.error || "Eitthvað fór úrskeiðis")
      setLoading(false)
      return
    }

    router.push("/admin/rooms")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Grunnupplýsingar</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Heiti þvottahúss *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            placeholder="t.d. Þvottahús kjallara"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lýsing</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            placeholder="t.d. Staðsett í kjallara við inngang A"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Tæki</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fjöldi þvottavéla</label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.washingMachines}
              onChange={(e) => set("washingMachines", parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fjöldi þurrkara</label>
            <input
              type="number"
              min={0}
              max={20}
              value={form.dryers}
              onChange={(e) => set("dryers", parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lengd tíma (mínútur)</label>
          <div className="flex flex-wrap gap-2">
            {[30, 45, 60, 90, 120].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set("slotDurationMinutes", m)}
                className={`px-4 py-2 rounded-lg text-sm border font-medium transition-all ${
                  form.slotDurationMinutes === m
                    ? "bg-blue-700 text-white border-blue-700"
                    : "border-gray-200 text-gray-700 hover:border-blue-300"
                }`}
              >
                {m} mín.
              </button>
            ))}
            <input
              type="number"
              min={15}
              max={240}
              value={form.slotDurationMinutes}
              onChange={(e) => set("slotDurationMinutes", parseInt(e.target.value))}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sérstillt"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Tilkynningar</h2>
        <p className="text-sm text-gray-500">
          Stilltu hvenær notendur fá tilkynningu fyrir byrjun og lok tíma.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mín. áður en tími byrjar
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={120}
                value={form.notifyMinutesBefore}
                onChange={(e) => set("notifyMinutesBefore", parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">mín.</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mín. áður en tími klárast
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={60}
                value={form.notifyMinutesBeforeEnd}
                onChange={(e) => set("notifyMinutesBeforeEnd", parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">mín.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Hætta við
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {form.id ? "Vista breytingar" : "Búa til þvottahús"}
        </button>
      </div>
    </form>
  )
}
