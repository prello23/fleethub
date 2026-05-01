import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SubscriptionManager from "@/components/SubscriptionManager"

export default async function SubscriptionsPage() {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/rooms")

  const [subscriptions, plans, admins] = await Promise.all([
    prisma.subscription.findMany({
      include: { user: { select: { id: true, name: true, email: true } }, plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.plan.findMany({ where: { active: true }, orderBy: { price: "asc" } }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true, subscription: { include: { plan: true } } },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Áskriftir</h1>
        <p className="text-gray-500 text-sm mt-1">Stjórnaðu áskriftum allra Admin notenda</p>
      </div>
      <SubscriptionManager subscriptions={subscriptions} plans={plans} admins={admins} />
    </div>
  )
}
