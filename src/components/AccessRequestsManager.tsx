"use client"

import { useState } from "react"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useT } from "@/components/LanguageProvider"
import type { TKey } from "@/lib/i18n"

export type Req = {
  id: string
  status: string
  createdAt: Date
  user: { id: string; name: string; email: string; apartment: string | null }
  room: { id: string; name: string }
}

type Props = {
  requests: Req[]
}

export default function AccessRequestsManager({ requests: initialRequests }: Props) {
  const { t } = useT()
  const [requests, setRequests] = useState<Req[]>(initialRequests)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleAction(id: string, action: "approve" | "deny") {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/access-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        const updated = await res.json()
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r))
        )
      }
    } catch {
      // silent failure
    }
    setLoadingId(null)
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">{t("access.noRequests")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div
          key={req.id}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{req.user.name}</p>
              {req.user.apartment && (
                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  Apt. {req.user.apartment}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{req.user.email}</p>
            <p className="text-sm text-gray-700">
              Room: <strong>{req.room.name}</strong>
            </p>
            <p className="text-xs text-gray-400">
              {new Date(req.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={req.status} t={t} />

            {req.status === "PENDING" && (
              <>
                <button
                  onClick={() => handleAction(req.id, "approve")}
                  disabled={loadingId === req.id}
                  className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                >
                  {loadingId === req.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  {t("access.approve")}
                </button>
                <button
                  onClick={() => handleAction(req.id, "deny")}
                  disabled={loadingId === req.id}
                  className="flex items-center gap-1.5 border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-60"
                >
                  {loadingId === req.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <XCircle size={14} />
                  )}
                  {t("access.deny")}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status, t }: { status: string; t: (k: TKey) => string }) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
          {t("access.approved")}
        </span>
      )
    case "DENIED":
      return (
        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
          {t("access.denied2")}
        </span>
      )
    default:
      return (
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
          {t("access.pending")}
        </span>
      )
  }
}
