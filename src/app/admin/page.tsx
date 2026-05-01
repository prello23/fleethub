import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { WashingMachine, Users, Plus, Settings, Receipt } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin Panel | Booking System" }

export default async function AdminPage() {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) redirect("/rooms")

  const isAdmin = session.user.role === "ADMIN"

  const [roomCount, userCount, bookingCount, pendingCharges] = await Promise.all([
    isAdmin
      ? prisma.room.count({ where: { ownerId: session.user.id } })
      : prisma.room.count(),
    prisma.user.count(),
    prisma.booking.count({ where: { startTime: { gte: new Date() } } }),
    prisma.charge.count({ where: { status: "PENDING", ...(isAdmin ? { room: { ownerId: session.user.id } } : {}) } }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1">Laundry booking management</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Rooms</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{roomCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Users</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{userCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Upcoming bookings</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{bookingCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Pending charges</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCharges}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/rooms" className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <WashingMachine className="text-blue-700" size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">Laundry Rooms</h2>
          </div>
          <p className="text-sm text-gray-500">Manage rooms, assign users, set slot pricing and generate QR codes.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
            <Settings size={14} /> Manage rooms
          </span>
        </Link>

        <Link href="/admin/users" className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="text-purple-700" size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">Users</h2>
          </div>
          <p className="text-sm text-gray-500">Create users, set passwords and manage access to rooms.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-purple-600 font-medium group-hover:gap-2 transition-all">
            <Users size={14} /> Manage users
          </span>
        </Link>

        <Link href="/admin/charges" className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-amber-200 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Receipt className="text-amber-700" size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">Charges</h2>
          </div>
          <p className="text-sm text-gray-500">Track slot charges per resident and mark payments.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-amber-600 font-medium group-hover:gap-2 transition-all">
            <Receipt size={14} /> View charges
          </span>
        </Link>

        <Link href="/admin/rooms/new" className="bg-blue-700 rounded-2xl p-6 hover:bg-blue-800 transition-all text-white group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus size={20} />
            </div>
            <h2 className="font-semibold">New room</h2>
          </div>
          <p className="text-sm text-blue-200">Add a new laundry room with custom configuration.</p>
        </Link>
      </div>
    </div>
  )
}
