"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { WashingMachine, LogOut, Settings, Home, Users, Crown } from "lucide-react"
import { useState } from "react"

export default function Navigation() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const role = session?.user?.role

  const navBg = role === "SUPER_ADMIN"
    ? "bg-gradient-to-r from-purple-800 to-indigo-800"
    : "bg-blue-700"

  return (
    <nav className={`${navBg} text-white shadow-lg`}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80">
          <WashingMachine size={24} />
          <span className="hidden sm:inline">Þvottahús</span>
        </Link>

        {session ? (
          <div className="flex items-center gap-4">
            {/* Super Admin nav */}
            {role === "SUPER_ADMIN" && (
              <>
                <Link href="/superadmin" className="flex items-center gap-1 text-sm hover:opacity-80">
                  <Crown size={16} />
                  <span className="hidden sm:inline">Super Admin</span>
                </Link>
                <Link href="/superadmin/admins" className="flex items-center gap-1 text-sm hover:opacity-80">
                  <Users size={16} />
                  <span className="hidden sm:inline">Aðgangar</span>
                </Link>
              </>
            )}

            {/* Admin nav */}
            {(role === "ADMIN" || role === "SUPER_ADMIN") && (
              <>
                <Link href="/admin" className="flex items-center gap-1 text-sm hover:opacity-80">
                  <Settings size={16} />
                  <span className="hidden sm:inline">Stjórnun</span>
                </Link>
              </>
            )}

            <Link href="/rooms" className="flex items-center gap-1 text-sm hover:opacity-80">
              <Home size={16} />
              <span className="hidden sm:inline">Þvottahús</span>
            </Link>

            {/* Avatar dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  role === "SUPER_ADMIN"
                    ? "bg-yellow-500 text-yellow-900"
                    : "bg-blue-500 hover:bg-blue-400"
                }`}
              >
                {session.user.name?.[0]?.toUpperCase() ?? "N"}
              </button>
              {open && (
                <div className="absolute right-0 top-10 bg-white text-gray-800 rounded-xl shadow-xl border w-56 z-50">
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm">{session.user.name}</p>
                      {role === "SUPER_ADMIN" && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                          <Crown size={9} /> Super
                        </span>
                      )}
                      {role === "ADMIN" && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Admin</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                    {session.user.apartment && (
                      <p className="text-xs text-blue-600 mt-0.5">Íbúð {session.user.apartment}</p>
                    )}
                  </div>
                  {role === "SUPER_ADMIN" && (
                    <div className="border-b border-gray-100">
                      <Link href="/superadmin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-purple-50 text-purple-700">
                        <Crown size={14} /> Super Admin yfirlit
                      </Link>
                      <Link href="/superadmin/plans" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-purple-50 text-purple-700">
                        Verðáætlanir
                      </Link>
                      <Link href="/superadmin/subscriptions" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-purple-50 text-purple-700">
                        Áskriftir
                      </Link>
                    </div>
                  )}
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
            <Link href="/login" className="text-sm hover:opacity-80">Innskráning</Link>
            <Link href="/register" className="bg-white text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-50">
              Nýskráning
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
