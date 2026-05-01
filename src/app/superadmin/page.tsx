import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Crown, Users, CreditCard, WashingMachine, TrendingUp, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"

export default async function SuperAdminPage() {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/rooms")

  const [totalUsers, totalAdmins, totalRooms, totalBookings, activeSubs, plans, recentSubs] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.room.count(),
    prisma.booking.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.plan.findMany({ where: { active: true }, orderBy: { price: "asc" } }),
    prisma.subscription.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } }, plan: true },
    }),
  ])

  const adminsWithoutSub = await prisma.user.count({
    where: { role: "ADMIN", subscription: null },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Crown className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
          <p className="text-gray-500 text-sm">System overview</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Admins</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{totalAdmins}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Laundry rooms</p>
          <p className="text-3xl font-bold text-teal-600 mt-1">{totalRooms}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active subscriptions</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{activeSubs}</p>
        </div>
      </div>

      {/* Alert for admins without subscription */}
      {adminsWithoutSub > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
          <div>
            <p className="font-medium text-amber-800">{adminsWithoutSub} Admin{adminsWithoutSub > 1 ? "s" : ""} without a subscription</p>
            <p className="text-sm text-amber-600">
              <Link href="/superadmin/admins" className="underline">View Admins</Link> and assign a subscription.
            </p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link href="/superadmin/admins" className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="text-blue-700" size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">Admins &amp; Accounts</h2>
          </div>
          <p className="text-sm text-gray-500">View all admins, their subscriptions and bookings. Log in as any user.</p>
        </Link>

        <Link href="/superadmin/subscriptions" className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-green-200 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CreditCard className="text-green-700" size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">Subscriptions</h2>
          </div>
          <p className="text-sm text-gray-500">Manage subscriptions for all admins. Change plan, status and end date.</p>
        </Link>

        <Link href="/superadmin/plans" className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-purple-200 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-purple-700" size={20} />
            </div>
            <h2 className="font-semibold text-gray-900">Plans</h2>
          </div>
          <p className="text-sm text-gray-500">Create and edit pricing plans for admin accounts.</p>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Plans overview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Plans</h3>
            <Link href="/superadmin/plans" className="text-xs text-purple-600 hover:underline">See all</Link>
          </div>
          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{plan.name}</p>
                  <p className="text-xs text-gray-400">Up to {plan.maxRooms === 999 ? "∞" : plan.maxRooms} laundry rooms</p>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {plan.price.toLocaleString("en-US")} {plan.currency}/mo.
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent subscriptions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent subscriptions</h3>
            <Link href="/superadmin/subscriptions" className="text-xs text-green-600 hover:underline">See all</Link>
          </div>
          <div className="space-y-3">
            {recentSubs.length === 0 && (
              <p className="text-sm text-gray-400">No subscriptions yet</p>
            )}
            {recentSubs.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{sub.user.name}</p>
                  <p className="text-xs text-gray-400">{sub.plan.name}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    sub.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                    sub.status === "TRIAL" ? "bg-blue-100 text-blue-700" :
                    sub.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {sub.status === "ACTIVE" ? "Active" : sub.status === "TRIAL" ? "Trial" : sub.status === "CANCELLED" ? "Cancelled" : "Expired"}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(sub.createdAt), "d MMM", { locale: enUS })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
