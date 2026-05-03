"use client"

import { RefreshCw, CheckCircle } from "lucide-react"
import { useT } from "@/components/LanguageProvider"
import { useUpdateAvailable } from "@/components/UpdateBanner"

export default function CheckForUpdates({ currentVersion }: { currentVersion: string }) {
  const { t } = useT()
  const { updateAvailable, triggerUpdate } = useUpdateAvailable()

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">App version</h2>
      <p className="text-sm text-gray-500 mb-4">v{currentVersion}</p>

      {updateAvailable ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-amber-700 font-medium">{t("update.available")}</span>
          <button
            onClick={triggerUpdate}
            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600"
          >
            <RefreshCw size={14} />
            {t("update.button")}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} />
          Appið er uppfært
        </div>
      )}
    </div>
  )
}
