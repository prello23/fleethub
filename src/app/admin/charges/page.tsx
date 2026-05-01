import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Receipt } from "lucide-react"
import ChargesTable from "@/components/ChargesTable"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Charges | Admin" }

export default async function AdminChargesPage() {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) redirect("/rooms")

  const isAdmin = session.user.role === "ADMIN"
  const charges = await prisma.charge.findMany({
    where: isAdmin ? { room: { ownerId: session.user.id } } : {},
    include: {
      user: { select: { id: true, name: true, email: true, apartment: true } },
      room: { select: { id: true, name: true } },
      booking: { select: { id: true, startTime: true, endTime: true, machineType: true, machineNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const pending = charges.filter((c) => c.status === "PENDING").reduce((s, c) => s + c.amount, 0)
  const paid = charges.filter((c) => c.status === "PAID").reduce((s, c) => s + c.amount, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <Receipt className="text-amber-700" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Charges</h1>
          <p className="text-gray-500 text-sm">{charges.length} total charge{charges.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pending.toLocaleString()} ISK</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Collected</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{paid.toLocaleString()} ISK</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{(pending + paid).toLocaleString()} ISK</p>
        </div>
      </div>

      <ChargesTable charges={charges} />
    </div>
  )
}
