"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { RefreshCw } from "lucide-react"

// ---------- context ----------

type UpdateCtx = {
  updateAvailable: boolean
  triggerUpdate: () => void
}

const Ctx = createContext<UpdateCtx>({ updateAvailable: false, triggerUpdate: () => {} })

export function useUpdateAvailable() {
  return useContext(Ctx)
}

// ---------- provider ----------

export function UpdateProvider({
  initialVersion,
  children,
}: {
  initialVersion: string
  children: React.ReactNode
}) {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const waitingSWRef = useRef<ServiceWorker | null>(null)

  useEffect(() => {
    // Service Worker registration + updatefound listener
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        if (reg.waiting) {
          waitingSWRef.current = reg.waiting
          setUpdateAvailable(true)
        }

        reg.addEventListener("updatefound", () => {
          const sw = reg.installing
          if (!sw) return
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              waitingSWRef.current = sw
              setUpdateAvailable(true)
            }
          })
        })
      }).catch(() => {})
    }

    // Version-polling fallback — catches deploys even without SW
    const poll = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" })
        const data = await res.json()
        if (data.version && data.version !== initialVersion) setUpdateAvailable(true)
      } catch { /* network error */ }
    }

    poll()
    const id = setInterval(poll, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [initialVersion])

  function triggerUpdate() {
    // Tell the waiting SW to activate, then reload immediately.
    // The user tapped the button — this is the only place reload happens.
    if (waitingSWRef.current) {
      waitingSWRef.current.postMessage({ type: "SKIP_WAITING" })
    }
    window.location.reload()
  }

  return (
    <Ctx.Provider value={{ updateAvailable, triggerUpdate }}>
      {children}
    </Ctx.Provider>
  )
}

// ---------- banner UI ----------

export default function UpdateBanner() {
  const { updateAvailable, triggerUpdate } = useUpdateAvailable()

  if (!updateAvailable) return null

  return (
    <div className="w-full bg-amber-400 text-amber-950 px-4 py-2.5 flex items-center justify-center gap-3 z-50">
      <RefreshCw size={14} className="flex-shrink-0" />
      <span className="text-sm font-medium">Ný útgáfa er til staðar</span>
      <button
        onClick={triggerUpdate}
        className="bg-amber-950 text-amber-50 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-amber-900 transition-colors"
      >
        Uppfæra
      </button>
    </div>
  )
}
