"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { WashingMachine, LogOut, Settings, Home, Users, Crown, Calendar, User, FileCheck } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useT } from "@/components/LanguageProvider"
import { isBeta } from "@/lib/env"

export default function Navigation() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const role = session?.user?.role
  const { lang, setLang, t } = useT()

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const navBg = role === "SUPER_ADMIN"
    ? "bg-gradient-to-r from-purple-800 to-indigo-800"
    : "bg-blue-700"

  return (
    <nav className={`${navBg} text-white shadow-lg`}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80">
          <WashingMachine size={24} />
          <span className="hidden sm:inline">{t("nav.laundry")}</span>
          {isBeta && (
            <span className="text-[10px] font-bold bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded uppercase tracking-wide">
              BETA
            </span>
          )}
        </Link>

        {session ? (
          <div className="flex items-center gap-1 sm:gap-4">
            {role === "SUPER_ADMIN" && (
              <>
                <Link href="/superadmin" className="hidden sm:flex items-center gap-1.5 text-sm hover:opacity-80 px-2 py-1.5 rounded-lg hover:bg-white/10">
                  <Crown size={16} />
                  Super Admin
                </Link>
                <Link href="/superadmin/admins" className="hidden sm:flex items-center gap-1.5 text-sm hover:opacity-80 px-2 py-1.5 rounded-lg hover:bg-white/10">
                  <Users size={16} />
                  Accounts
                </Link>
              </>
            )}

            {(role === "ADMIN" || role === "SUPER_ADMIN") && (
              <Link href="/admin" className="hidden sm:flex items-center gap-1.5 text-sm hover:opacity-80 px-2 py-1.5 rounded-lg hover:bg-white/10">
                <Settings size={16} />
                {t("nav.admin")}
              </Link>
            )}

            <Link href="/rooms" className="hidden sm:flex items-center gap-1.5 text-sm hover:opacity-80 px-2 py-1.5 rounded-lg hover:bg-white/10">
              <Home size={16} />
              {t("nav.rooms")}
            </Link>

            <button
              onClick={() => setLang(lang === "en" ? "is" : "en")}
              className="text-xs px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 font-medium"
            >
              {lang === "en" ? "IS" : "EN"}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  role === "SUPER_ADMIN" ? "bg-yellow-500 text-yellow-900" : "bg-blue-500 hover:bg-blue-400"
                }`}
              >
                {session.user.name?.[0]?.toUpperCase() ?? "?"}
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
                      <p className="text-xs text-blue-600 mt-0.5">Apt. {session.user.apartment}</p>
                    )}
                  </div>

                  {role === "SUPER_ADMIN" && (
                    <div className="border-b border-gray-100">
                      <Link href="/superadmin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-purple-50 text-purple-700">
                        <Crown size={14} /> Super Admin
                      </Link>
                      <Link href="/superadmin/plans" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-purple-50 text-purple-700">
                        Plans
                      </Link>
                      <Link href="/superadmin/subscriptions" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-purple-50 text-purple-700">
                        Subscriptions
                      </Link>
                    </div>
                  )}

                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <div className="sm:hidden border-b border-gray-100">
                      <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">
                        <Settings size={14} /> {t("nav.admin")}
                      </Link>
                    </div>
                  )}

                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <div className="border-b border-gray-100">
                      <Link href="/admin/access-requests" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">
                        <FileCheck size={14} /> {t("access.requests")}
                      </Link>
                    </div>
                  )}

                  <div className="border-b border-gray-100">
                    <Link href="/rooms" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">
                      <Home size={14} /> {t("nav.rooms")}
                    </Link>
                    <Link href="/my-bookings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">
                      <Calendar size={14} /> {t("nav.myBookings")}
                    </Link>
                    <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">
                      <User size={14} /> {t("nav.profile")}
                    </Link>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 text-red-600"
                  >
                    <LogOut size={16} />
                    {t("nav.signOut")}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "en" ? "is" : "en")}
              className="text-xs px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 font-medium"
            >
              {lang === "en" ? "IS" : "EN"}
            </button>
            <Link href="/login" className="text-sm hover:opacity-80">{t("nav.signIn")}</Link>
            <Link href="/register" className="bg-white text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-50">
              {t("nav.register")}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
