import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PlanManager from "@/components/PlanManager"

export default async function PlansPage() {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/rooms")

  const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Verðáætlanir</h1>
        <p className="text-gray-500 text-sm mt-1">Settu verð á Admin aðganga — venjulegir notendur borga ekki</p>
      </div>
      <PlanManager initialPlans={plans} />
    </div>
  )
}
