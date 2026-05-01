import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { WashingMachine, Waves, Clock, Settings, ArrowLeft } from "lucide-react"
import BookingCalendar from "@/components/BookingCalendar"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const room = await prisma.room.findUnique({ where: { id }, select: { name: true } })
  return { title: room ? `${room.name} | Bókunarkerfi` : "Þvottahús | Bókunarkerfi" }
}

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  const room = await prisma.room.findUnique({ where: { id } })
  if (!room) notFound()

  const isAdminOrSuper = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/rooms" className="p-2 rounded-lg hover:bg-gray-200 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <WashingMachine className="text-blue-600" size={22} />
            <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
            {isAdminOrSuper && (
              <Link
                href={`/admin/rooms/${room.id}`}
                className="p-2.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 touch-manipulation"
                title="Breyta stillingum"
              >
                <Settings size={18} />
              </Link>
            )}
          </div>
          {room.description && (
            <p className="text-gray-500 text-sm mt-0.5">{room.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-sm">
          <WashingMachine size={16} className="text-blue-500" />
          <span className="text-gray-600">{room.washingMachines} þvottavélar</span>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-sm">
          <Waves size={16} className="text-teal-500" />
          <span className="text-gray-600">{room.dryers} þurrkarar</span>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-sm">
          <Clock size={16} className="text-gray-400" />
          <span className="text-gray-600">{room.slotDurationMinutes} mínútna tímar</span>
        </div>
      </div>

      <BookingCalendar
        room={{
          id: room.id,
          name: room.name,
          washingMachines: room.washingMachines,
          dryers: room.dryers,
          slotDurationMinutes: room.slotDurationMinutes,
        }}
        currentUserId={session.user.id}
        currentUserName={session.user.name ?? ""}
      />
    </div>
  )
}
