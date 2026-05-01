import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminOverview from "@/components/AdminOverview"

export default async function SuperAdminAdminsPage() {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/rooms")

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    include: {
      subscription: { include: { plan: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, apartment: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admins &amp; Notendur</h1>
        <p className="text-gray-500 text-sm mt-1">Skoðaðu aðgang allra og breyttu hlutverkum</p>
      </div>
      <AdminOverview admins={admins} allUsers={allUsers} />
    </div>
  )
}
