"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, X } from "lucide-react"

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this booking?")) return
    setLoading(true)
    await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors flex-shrink-0"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
      Cancel
    </button>
  )
}
