import type { Metadata } from "next"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/auth"
import Navigation from "@/components/Navigation"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"

export const metadata: Metadata = {
  title: "Þvottahús – Bókunarkerfi",
  description: "Bókuðu þvottavél og þurrkara í þínu þvottahúsi",
  manifest: "/manifest.json",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="is" className="h-full">
      <body className="min-h-full bg-gray-50 flex flex-col">
        <SessionProvider session={session}>
          <ServiceWorkerRegistration />
          <Navigation />
          <main className="flex-1">{children}</main>
          <footer className="text-center text-xs text-gray-400 py-4">
            Þvottahús bókunarkerfi
          </footer>
        </SessionProvider>
      </body>
    </html>
  )
}
