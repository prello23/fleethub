import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Users } from "lucide-react"
import UserTable from "@/components/UserTable"
import CreateUserForm from "@/components/CreateUserForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Users | Admin" }

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) redirect("/rooms")

  const isAdmin = session.user.role === "ADMIN"

  // Admin sees only users in their rooms; super admin sees all
  let users
  if (isAdmin) {
    const adminRooms = await prisma.room.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    })
    const roomIds = adminRooms.map((r) => r.id)
    const userRooms = await prisma.userRoom.findMany({
      where: { roomId: { in: roomIds } },
      select: { userId: true },
      distinct: ["userId"],
    })
    const userIds = userRooms.map((ur) => ur.userId)
    users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true, apartment: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })
  } else {
    users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, apartment: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })
  }

  const rooms = await prisma.room.findMany({
    where: isAdmin ? { ownerId: session.user.id } : undefined,
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Users className="text-purple-700" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <CreateUserForm rooms={rooms} />

      <UserTable users={users} currentUserId={session.user.id} />
    </div>
  )
}
