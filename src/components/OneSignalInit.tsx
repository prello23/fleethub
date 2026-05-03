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
  const { data: session, status } = useSession()

  useEffect(() => {
    // Only initialise and prompt after the user is authenticated
    if (status !== "authenticated" || !APP_ID || !session?.user) return

    const userId = session.user.id
    const email = session.user.email ?? undefined

    window.OneSignalDeferred = window.OneSignalDeferred ?? []

    window.OneSignalDeferred.push(async (os) => {
      await os.init({
        appId: APP_ID,
        serviceWorkerPath: "/OneSignalSDKWorker.js",
      })
      await os.login(userId)
      if (email) os.User.addEmail(email)
    })

    const script = document.createElement("script")
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
    script.defer = true
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [status, session?.user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
