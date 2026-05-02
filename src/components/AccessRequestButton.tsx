"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useT } from "@/components/LanguageProvider"

type Props = {
  roomId: string
}

export default function AccessRequestButton({ roomId }: Props) {
  const { t } = useT()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleRequest() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })
      if (res.ok || res.status === 409) {
        setSent(true)
      } else {
        setError(t("access.requestFailed"))
      }
    } catch {
      setError(t("access.requestFailed"))
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <span className="flex-1 flex items-center justify-center gap-2 border border-amber-300 text-amber-700 bg-amber-50 py-2 rounded-xl text-sm font-medium">
        {t("rooms.pendingApproval")}
      </span>
    )
  }

  return (
    <div className="flex-1 flex flex-col gap-1">
      <button
        onClick={handleRequest}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 rounded-xl text-sm font-medium disabled:opacity-60"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        {t("rooms.requestAccess")}
      </button>
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  )
}
