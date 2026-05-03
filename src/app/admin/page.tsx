import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getServerT } from "@/lib/server-i18n"
import Link from "next/link"
import { WashingMachine, Users, Plus, Settings, Receipt, FileCheck } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin Panel | Booking System" }

export default async function AdminPage() {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) redirect("/rooms")

  const { t } = await getServerT()
  const isAdmin = session.user.role === "ADMIN"
  const userId = session.user.id

  const now = new Date().toISOString()

  const roomCount = isAdmin
    ? (db.prepare(`SELECT COUNT(*) as c FROM "Room" WHERE ownerId = ?`).get(userId) as { c: number }).c
    : (db.prepare(`SELECT COUNT(*) as c FROM "Room"`).get() as { c: number }).c

  const userCount = (db.prepare(`SELECT COUNT(*) as c FROM "User"`).get() as { c: number }).c

  const bookingCount = (db.prepare(
    `SELECT COUNT(*) as c FROM "Booking" WHERE startTime >= ?`
  ).get(now) as { c: number }).c

  const pendingCharges = isAdmin
    ? (db.prepare(
        `SELECT COUNT(*) as c FROM "Charge" c2 JOIN "Room" r ON c2.roomId = r.id WHERE c2.status = 'PENDING' AND r.ownerId = ?`
      ).get(userId) as { c: number }).c
    : (db.prepare(`SELECT COUNT(*) as c FROM "Charge" WHERE status = 'PENDING'`).get() as { c: number }).c

  const pendingRequests = isAdmin
    ? (db.prepare(
        `SELECT COUNT(*) as c FROM "AccessRequest" ar JOIN "Room" r ON ar.roomId = r.id WHERE ar.status = 'PENDING' AND r.ownerId = ?`
      ).get(userId) as { c: number }).c
    : (db.prepare(`SELECT COUNT(*) as c FROM "AccessRequest" WHERE status = 'PENDING'`).get() as { c: number }).c

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("admin.panel")}</h1>
        <p className="text-gray-500 text-sm mt-1">{t("admin.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">{t("rooms.title")}</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{roomCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">{t("admin.users")}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{userCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">{t("admin.upcomingBookings")}</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{bookingCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">{t("admin.pendingCharges")}</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCharges}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">{t("admin.accessRequests")}</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{pendingRequests}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/rooms" className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <WashingMachine className="text-blue-700" size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">{t("rooms.title")}</h2>
          </div>
          <p className="text-sm text-gray-500">{t("admin.roomsDesc")}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
            <Settings size={14} /> {t("admin.manageRooms")}
          </span>
        </Link>

        <Link href="/admin/users" className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="text-purple-700" size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">{t("admin.users")}</h2>
          </div>
          <p className="text-sm text-gray-500">{t("admin.usersDesc")}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-purple-600 font-medium group-hover:gap-2 transition-all">
            <Users size={14} /> {t("admin.manageUsers")}
          </span>
        </Link>

        <Link href="/admin/charges" className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-amber-200 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Receipt className="text-amber-700" size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">{t("admin.charges")}</h2>
          </div>
          <p className="text-sm text-gray-500">{t("admin.chargesDesc")}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-amber-600 font-medium group-hover:gap-2 transition-all">
            <Receipt size={14} /> {t("admin.viewCharges")}
          </span>
        </Link>

        <Link href="/admin/access-requests" className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileCheck className="text-blue-700" size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">{t("access.requests")}</h2>
            {pendingRequests > 0 && (
              <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingRequests}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{t("admin.accessDesc")}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
            <FileCheck size={14} /> {t("admin.reviewRequests")}
          </span>
        </Link>

        <Link href="/admin/rooms/new" className="bg-blue-700 rounded-2xl p-6 hover:bg-blue-800 transition-all text-white group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus size={20} />
            </div>
            <h2 className="font-semibold">{t("admin.newRoom")}</h2>
          </div>
          <p className="text-sm text-blue-200">{t("admin.newRoomDesc")}</p>
        </Link>
      </div>
    </div>
  )
}
