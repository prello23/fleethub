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

    check() // check immediately on mount
    const interval = setInterval(check, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [initialVersion])

  if (!updateAvailable) return null

  return (
    <div className="w-full bg-blue-700 text-white px-4 py-2.5 flex items-center justify-center gap-3 z-50">
      <RefreshCw size={14} className="flex-shrink-0" />
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
