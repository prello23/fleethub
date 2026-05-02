"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { useT } from "@/components/LanguageProvider"

export default function UpdateBanner({ initialVersion }: { initialVersion: string }) {
  const { t } = useT()
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" })
        const data = await res.json()
        if (data.version && data.version !== initialVersion) {
          setUpdateAvailable(true)
        }
      } catch {
        // network error — ignore
      }
    }

    // Check every 5 minutes
    const interval = setInterval(check, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [initialVersion])

  if (!updateAvailable) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-blue-700 text-white px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4">
      <RefreshCw size={16} />
      <span className="text-sm font-medium">{t("update.available")}</span>
      <button
        onClick={() => window.location.reload()}
        className="bg-white text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
      >
        {t("update.button")}
      </button>
    </div>
  )
}
