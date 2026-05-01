import type { Metadata } from "next"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import Navigation from "@/components/Navigation"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"

export const metadata: Metadata = {
  title: "Þvottahús – Bókunarkerfi",
  description: "Bókuðu þvottavél og þurrkara í þínu þvottahúsi",
  manifest: "/manifest.json",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="is" className="h-full">
      <body className="min-h-full bg-gray-50 flex flex-col">
        <SessionProvider>
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
