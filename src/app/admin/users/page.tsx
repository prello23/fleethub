import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Users } from "lucide-react"
import UserTable from "@/components/UserTable"

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/rooms")

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, apartment: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Users className="text-purple-700" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notendur</h1>
          <p className="text-gray-500 text-sm">{users.length} notendur skráðir</p>
        </div>
      </div>

      <UserTable users={users} currentUserId={session.user.id} />
    </div>
  )
}
