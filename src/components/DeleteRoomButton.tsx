"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"

export default function DeleteRoomButton({ roomId, roomName }: { roomId: string; roomName: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/rooms/${roomId}`, { method: "DELETE" })
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-red-600">Eyða &quot;{roomName}&quot;?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs bg-red-600 text-white px-2 py-1.5 rounded-lg hover:bg-red-700 flex items-center gap-1"
        >
          {loading ? <Loader2 size={10} className="animate-spin" /> : "Já"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          Nei
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 border border-gray-200"
    >
      <Trash2 size={12} />
      Eyða
    </button>
  )
}
