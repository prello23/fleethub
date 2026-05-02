import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getServerT } from "@/lib/server-i18n"
import AccessRequestsManager from "@/components/AccessRequestsManager"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Access Requests | Admin" }

export default async function AccessRequestsPage() {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/rooms")
  }

  const { t } = await getServerT()
  const isAdmin = session.user.role === "ADMIN"

  const requests = await prisma.accessRequest.findMany({
    where: isAdmin
      ? { room: { ownerId: session.user.id } }
      : undefined,
    include: {
      user: { select: { id: true, name: true, email: true, apartment: true } },
      room: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const serialized = requests.map((r) => ({
    ...r,
    createdAt: r.createdAt,
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("access.requests")}</h1>
        <p className="text-gray-500 text-sm mt-1">{t("admin.accessRequestsSubtitle")}</p>
      </div>

      <AccessRequestsManager requests={serialized} />
    </div>
  )
}
