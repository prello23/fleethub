import type { Metadata, Viewport } from "next"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import Navigation from "@/components/Navigation"
import OneSignalInit from "@/components/OneSignalInit"
import { LanguageProvider } from "@/components/LanguageProvider"
import UpdateBanner from "@/components/UpdateBanner"
import type { Lang } from "@/lib/i18n"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Laundry – Booking System",
  description: "Book laundry machines in your building",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Laundry",
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang: Lang = (await cookies()).get("lang")?.value === "is" ? "is" : "en"

  return (
    <html lang={lang} className="h-full">
      <body className="min-h-full bg-gray-50 flex flex-col">
        <SessionProvider>
          <LanguageProvider initialLang={lang}>
            <OneSignalInit />
            <UpdateBanner initialVersion={APP_VERSION} />
            <Navigation />
            <main className="flex-1">{children}</main>
            <footer className="text-center text-xs text-gray-400 py-4">
              Laundry booking system &mdash; v{APP_VERSION}
            </footer>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
