"use client"

import { useState } from "react"
import { format } from "date-fns"
import { WashingMachine, Waves, Check, Loader2 } from "lucide-react"

type Charge = {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string | Date
  user: { id: string; name: string; email: string; apartment: string | null }
  room: { id: string; name: string }
  booking: { id: string; startTime: string | Date; endTime: string | Date; machineType: string; machineNumber: number }
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  WAIVED: "bg-gray-100 text-gray-500",
}

export default function ChargesTable({ charges }: { charges: Charge[] }) {
  const [items, setItems] = useState(charges)
  const [loading, setLoading] = useState<string | null>(null)

  async function setStatus(id: string, status: string) {
    setLoading(id)
    const res = await fetch("/api/admin/charges", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
    }
    setLoading(null)
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
        <Receipt className="mx-auto text-gray-300 mb-3" size={40} />
        <p className="text-gray-500 text-sm">No charges yet. Set a price per slot on a room to start tracking.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Resident</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Room</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Slot</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{c.user.name}</p>
                  {c.user.apartment && <p className="text-xs text-gray-400">Apt. {c.user.apartment}</p>}
                </td>
                <td className="px-5 py-3 text-gray-600">{c.room.name}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  <div className="flex items-center gap-1 mb-0.5">
                    {c.booking.machineType === "WASHER"
                      ? <WashingMachine size={11} className="text-blue-400" />
                      : <Waves size={11} className="text-teal-400" />}
                    {c.booking.machineType === "WASHER" ? "Washer" : "Dryer"} {c.booking.machineNumber}
                  </div>
                  <span>{format(new Date(c.booking.startTime), "d MMM, HH:mm")} – {format(new Date(c.booking.endTime), "HH:mm")}</span>
                </td>
                <td className="px-5 py-3 font-semibold text-gray-800">
                  {c.amount.toLocaleString()} {c.currency}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${STATUS_STYLE[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {c.status === "PENDING" && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setStatus(c.id, "PAID")}
                        disabled={loading === c.id}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading === c.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                        Mark paid
                      </button>
                      <button
                        onClick={() => setStatus(c.id, "WAIVED")}
                        disabled={loading === c.id}
                        className="text-xs px-2 py-1.5 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        Waive
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Receipt({ className, size }: { className?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M14 8H8" /><path d="M16 12H8" /><path d="M13 16H8" />
    </svg>
  )
}
