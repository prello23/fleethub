"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { WashingMachine, LogOut, Settings, Home, Users } from "lucide-react"
import { useState } from "react"

export default function Navigation() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80">
          <WashingMachine size={24} />
          <span className="hidden sm:inline">Þvottahús</span>
        </Link>

        {session ? (
          <div className="flex items-center gap-4">
            <Link href="/rooms" className="flex items-center gap-1 text-sm hover:opacity-80">
              <Home size={16} />
              <span className="hidden sm:inline">Þvottahús</span>
            </Link>

            {session.user.role === "ADMIN" && (
              <>
                <Link href="/admin" className="flex items-center gap-1 text-sm hover:opacity-80">
                  <Settings size={16} />
                  <span className="hidden sm:inline">Stjórnun</span>
                </Link>
                <Link href="/admin/users" className="flex items-center gap-1 text-sm hover:opacity-80">
                  <Users size={16} />
                  <span className="hidden sm:inline">Notendur</span>
                </Link>
              </>
            )}

            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center font-bold text-sm"
              >
                {session.user.name?.[0]?.toUpperCase() ?? "N"}
              </button>
              {open && (
                <div className="absolute right-0 top-10 bg-white text-gray-800 rounded-lg shadow-xl border w-52 z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold text-sm">{session.user.name}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                    {session.user.apartment && (
                      <p className="text-xs text-blue-600">Íbúð {session.user.apartment}</p>
                    )}
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 text-red-600"
                  >
                    <LogOut size={16} />
                    Skrá út
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm hover:opacity-80">
              Innskráning
            </Link>
            <Link
              href="/register"
              className="bg-white text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-50"
            >
              Nýskráning
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
