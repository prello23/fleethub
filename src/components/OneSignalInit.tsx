"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"

type OSNotifications = {
  permission: boolean
  requestPermission: () => Promise<void>
  addEventListener: (event: string, cb: (val: boolean) => void) => void
}
type OSUser = { addEmail: (email: string) => void }
type OneSignalInstance = {
  init: (cfg: { appId: string; serviceWorkerPath?: string }) => Promise<void>
  login: (externalId: string) => Promise<void>
  Notifications: OSNotifications
  User: OSUser
}

declare global {
  interface Window {
    OneSignalDeferred?: ((os: OneSignalInstance) => Promise<void> | void)[]
  }
}

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

export default function OneSignalInit() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!APP_ID) return

    window.OneSignalDeferred = window.OneSignalDeferred ?? []
    window.OneSignalDeferred.push(async (os) => {
      await os.init({
        appId: APP_ID,
        serviceWorkerPath: "/OneSignalSDKWorker.js",
      })
    })

    const script = document.createElement("script")
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
    script.defer = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // Link logged-in user to OneSignal external_id + email
  useEffect(() => {
    if (!APP_ID || !session?.user) return
    const userId = session.user.id
    const email = session.user.email ?? undefined

    window.OneSignalDeferred = window.OneSignalDeferred ?? []
    window.OneSignalDeferred.push(async (os) => {
      await os.login(userId)
      if (email) os.User.addEmail(email)
    })
  }, [session?.user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
