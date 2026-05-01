import type { Metadata, Viewport } from "next"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import Navigation from "@/components/Navigation"
import OneSignalInit from "@/components/OneSignalInit"

export const metadata: Metadata = {
  title: "Þvottahús – Bókunarkerfi",
  description: "Bókuðu þvottavél og þurrkara í þínu þvottahúsi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Þvottahús",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
}

const APP_VERSION = process.env.APP_VERSION ?? "1.0.0"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="is" className="h-full">
      <body className="min-h-full bg-gray-50 flex flex-col">
        <SessionProvider>
          <OneSignalInit />
          <Navigation />
          <main className="flex-1">{children}</main>
          <footer className="text-center text-xs text-gray-400 py-4">
            Þvottahús bókunarkerfi &mdash; v{APP_VERSION}
          </footer>
        </SessionProvider>
      </body>
    </html>
  )
}
