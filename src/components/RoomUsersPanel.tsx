"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, X, Users, Loader2 } from "lucide-react"

type User = { id: string; name: string; email: string; apartment: string | null }

export default function RoomUsersPanel({
  roomId,
  assignedUsers,
  allUsers,
}: {
  roomId: string
  assignedUsers: User[]
  allUsers: User[]
}) {
  const router = useRouter()
  const [assigned, setAssigned] = useState<User[]>(assignedUsers)
  const [loading, setLoading] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [selectedId, setSelectedId] = useState("")

  const unassigned = allUsers.filter((u) => !assigned.find((a) => a.id === u.id))

  async function addUser() {
    if (!selectedId) return
    setAdding(true)
    const res = await fetch(`/api/rooms/${roomId}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedId }),
    })
    if (res.ok) {
      const user = allUsers.find((u) => u.id === selectedId)
      if (user) setAssigned((prev) => [...prev, user])
      setSelectedId("")
      router.refresh()
    }
    setAdding(false)
  }

  async function removeUser(userId: string) {
    setLoading(userId)
    await fetch(`/api/rooms/${roomId}/users`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    setAssigned((prev) => prev.filter((u) => u.id !== userId))
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-blue-600" />
        <h3 className="font-semibold text-gray-900">Residents with access</h3>
        <span className="ml-auto text-xs text-gray-400">{assigned.length} assigned</span>
      </div>

      {/* Add user */}
      {unassigned.length > 0 && (
        <div className="flex gap-2 mb-4">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a user to add…</option>
            {unassigned.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}{u.apartment ? ` (apt. ${u.apartment})` : ""} — {u.email}
              </option>
            ))}
          </select>
          <button
            onClick={addUser}
            disabled={!selectedId || adding}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Add
          </button>
        </div>
      )}

      {assigned.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No residents assigned yet</p>
      ) : (
        <div className="space-y-2">
          {assigned.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}{u.apartment ? ` · apt. ${u.apartment}` : ""}</p>
              </div>
              <button
                onClick={() => removeUser(u.id)}
                disabled={loading === u.id}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                {loading === u.id ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
