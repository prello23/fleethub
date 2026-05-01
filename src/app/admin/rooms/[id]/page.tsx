import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import RoomForm from "@/components/RoomForm"

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/rooms")

  const { id } = await params
  const room = await prisma.room.findUnique({ where: { id } })
  if (!room) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/rooms" className="p-2 rounded-lg hover:bg-gray-200 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Breyta þvottahúsi</h1>
          <p className="text-gray-500 text-sm">{room.name}</p>
        </div>
      </div>

      <RoomForm
        initial={{
          id: room.id,
          name: room.name,
          description: room.description ?? "",
          washingMachines: room.washingMachines,
          dryers: room.dryers,
          slotDurationMinutes: room.slotDurationMinutes,
          notifyMinutesBefore: room.notifyMinutesBefore,
          notifyMinutesBeforeEnd: room.notifyMinutesBeforeEnd,
        }}
      />
    </div>
  )
}
