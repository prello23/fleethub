"use client"

import { useState } from "react"
import { RefreshCw, CheckCircle, Loader2 } from "lucide-react"
import { useT } from "@/components/LanguageProvider"

export default function CheckForUpdates({ currentVersion }: { currentVersion: string }) {
  const { t } = useT()
  const [state, setState] = useState<"idle" | "checking" | "upToDate" | "updateAvailable">("idle")

  async function check() {
    setState("checking")
    try {
      const res = await fetch("/api/version", { cache: "no-store" })
      const data = await res.json()
      if (data.version && data.version !== currentVersion) {
        setState("updateAvailable")
      } else {
        setState("upToDate")
        setTimeout(() => setState("idle"), 3000)
      }
    } catch {
      setState("idle")
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">App version</h2>
      <p className="text-sm text-gray-500 mb-4">v{currentVersion}</p>

      {state === "updateAvailable" ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-blue-700 font-medium">Update available</span>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
          >
            <RefreshCw size={14} />
            {t("update.button")}
          </button>
        </div>
      ) : state === "upToDate" ? (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} />
          {t("update.upToDate")}
        </div>
      ) : (
        <button
          onClick={check}
          disabled={state === "checking"}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          {state === "checking"
            ? <Loader2 size={14} className="animate-spin" />
            : <RefreshCw size={14} />}
          {state === "checking" ? t("update.checking") : t("update.check")}
        </button>
      )}
    </div>
  )
}
