import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { WashingMachine, Users, Plus, Settings } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Stjórnborð | Bókunarkerfi" }

export default async function AdminPage() {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) redirect("/rooms")

  const [rooms, users, bookings] = await Promise.all([
    prisma.room.count(),
    prisma.user.count(),
    prisma.booking.count({ where: { startTime: { gte: new Date() } } }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Stjórnborð</h1>
        <p className="text-gray-500 text-sm mt-1">Umsjón þvottahús bókunarkerfis</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Þvottahús</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{rooms}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Notendur</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{users}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Komandi bókanir</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{bookings}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/admin/rooms"
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <WashingMachine className="text-blue-700" size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">Þvottahús</h2>
          </div>
          <p className="text-sm text-gray-500">
            Skoðaðu, breyttu eða búðu til ný þvottahús. Stilltu þvottavélar, þurrkkara og tímalengd.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
            <Settings size={14} /> Stjórna þvottahúsum
          </span>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="text-purple-700" size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">Notendur</h2>
          </div>
          <p className="text-sm text-gray-500">
            Skoðaðu notendur, breyttu réttindum og íbúðanúmerum.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-purple-600 font-medium group-hover:gap-2 transition-all">
            <Users size={14} /> Stjórna notendum
          </span>
        </Link>

        <Link
          href="/admin/rooms/new"
          className="bg-blue-700 rounded-2xl p-6 hover:bg-blue-800 transition-all text-white group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus size={20} />
            </div>
            <h2 className="font-semibold">Nýtt þvottahús</h2>
          </div>
          <p className="text-sm text-blue-200">
            Bættu við nýju þvottahúsi með sérstilltu uppsetning.
          </p>
        </Link>
      </div>
    </div>
  )
}
