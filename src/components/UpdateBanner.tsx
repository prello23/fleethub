"use client"

import { useEffect, useState, useRef } from "react"
import { RefreshCw } from "lucide-react"
import { useT } from "@/components/LanguageProvider"

export default function UpdateBanner({ initialVersion }: { initialVersion: string }) {
  const { t } = useT()
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const waitingSwRef = useRef<ServiceWorker | null>(null)

  useEffect(() => {
    // --- Service Worker registration + updatefound listener ---
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        // If there's already a waiting SW when we register, surface the banner
        if (reg.waiting) {
          waitingSwRef.current = reg.waiting
          setUpdateAvailable(true)
        }

        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing
          if (!newSW) return
          newSW.addEventListener("statechange", () => {
            if (newSW.state === "installed" && navigator.serviceWorker.controller) {
              waitingSwRef.current = newSW
              setUpdateAvailable(true)
            }
          })
        })
      }).catch(() => {})

      // When a new SW takes control, reload to get fresh content
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload()
      })
    }

    // --- Version polling fallback (catches deployments even without SW) ---
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

    check()
    const interval = setInterval(check, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [initialVersion])

  function handleUpdate() {
    if (waitingSwRef.current) {
      // Tell the waiting SW to activate; controllerchange listener reloads the page
      waitingSwRef.current.postMessage({ type: "SKIP_WAITING" })
    } else {
      window.location.reload()
    }
  }

  if (!updateAvailable) return null

  return (
    <div className="w-full bg-blue-700 text-white px-4 py-2.5 flex items-center justify-center gap-3 z-50">
      <RefreshCw size={14} className="flex-shrink-0" />
      <span className="text-sm font-medium">{t("update.available")}</span>
      <button
        onClick={handleUpdate}
        className="bg-white text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
      >
        {t("update.button")}
      </button>
    </div>
  )
}
