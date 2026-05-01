"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Shield, Crown, Eye, EyeOff, User, WashingMachine, Loader2, LogIn } from "lucide-react"

type Plan = { id: string; name: string; price: number; currency: string }
type Sub = { id: string; status: string; plan: Plan; endDate: string | Date | null }
type AdminUser = {
  id: string; name: string; email: string; role: string
  subscription: Sub | null
  _count: { bookings: number }
}
type AnyUser = { id: string; name: string; email: string; role: string; apartment: string | null; createdAt: string | Date }

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active", TRIAL: "Trial", CANCELLED: "Cancelled", EXPIRED: "Expired",
}
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  TRIAL: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
}

export default function AdminOverview({ admins, allUsers }: { admins: AdminUser[]; allUsers: AnyUser[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"admins" | "all">("admins")
  const [viewing, setViewing] = useState<string | null>(null)
  const [viewData, setViewData] = useState<Record<string, unknown> | null>(null)
  const [loadingView, setLoadingView] = useState(false)
  const [impersonating, setImpersonating] = useState<string | null>(null)
  const [changingRole, setChangingRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)

  async function viewUser(userId: string) {
    if (viewing === userId) { setViewing(null); setViewData(null); return }
    setLoadingView(true)
    setViewing(userId)
    const res = await fetch("/api/superadmin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    setViewData(data)
    setLoadingView(false)
  }

  async function impersonateUser(userId: string) {
    setImpersonating(userId)
    window.location.href = `/api/superadmin/impersonate?userId=${userId}`
  }

  async function changeRole(userId: string, role: string) {
    setRoleLoading(true)
    await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
    setChangingRole(null)
    setRoleLoading(false)
    router.refresh()
  }

  const ROLE_ICON: Record<string, React.ReactNode> = {
    SUPER_ADMIN: <Crown size={14} className="text-yellow-500" />,
    ADMIN: <Shield size={14} className="text-blue-500" />,
    USER: <User size={14} className="text-gray-400" />,
  }
  const ROLE_LABEL: Record<string, string> = {
    SUPER_ADMIN: "Super Admin", ADMIN: "Admin", USER: "User",
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setActiveTab("admins")} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === "admins" ? "bg-blue-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
          Admins ({admins.length})
        </button>
        <button onClick={() => setActiveTab("all")} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === "all" ? "bg-blue-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
          All users ({allUsers.length})
        </button>
      </div>

      {activeTab === "admins" && (
        <div className="space-y-3">
          {admins.map((admin) => (
            <div key={admin.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  {ROLE_ICON[admin.role]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{admin.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${admin.role === "SUPER_ADMIN" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                      {ROLE_LABEL[admin.role]}
                    </span>
                    {admin.subscription ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[admin.subscription.status]}`}>
                        {STATUS_LABELS[admin.subscription.status]} — {admin.subscription.plan.name}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">No subscription</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{admin.email} · {admin._count.bookings} bookings</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => viewUser(admin.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${viewing === admin.id ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {loadingView && viewing === admin.id ? <Loader2 size={12} className="animate-spin" /> : viewing === admin.id ? <EyeOff size={12} /> : <Eye size={12} />}
                    {viewing === admin.id ? "Close" : "View"}
                  </button>
                  <button
                    onClick={() => impersonateUser(admin.id)}
                    disabled={impersonating === admin.id}
                    title="Log in as this user"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 text-xs font-medium transition-all disabled:opacity-50"
                  >
                    {impersonating === admin.id ? <Loader2 size={12} className="animate-spin" /> : <LogIn size={12} />}
                    Login as
                  </button>
                </div>
              </div>

              {viewing === admin.id && viewData && (
                <div className="border-t border-gray-100 bg-gray-50 p-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">User info</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-500">Name:</span> <strong>{(viewData as Record<string, string>).name}</strong></p>
                        <p><span className="text-gray-500">Email:</span> {(viewData as Record<string, string>).email}</p>
                        <p><span className="text-gray-500">Role:</span> {ROLE_LABEL[(viewData as Record<string, string>).role]}</p>
                        <p><span className="text-gray-500">Joined:</span> {format(new Date((viewData as Record<string, string>).createdAt), "d MMM yyyy")}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <WashingMachine size={12} /> Recent bookings
                      </h4>
                      {((viewData as { bookings: Array<{ id: string; room: { name: string }; startTime: string; machineType: string }> }).bookings ?? []).length === 0 ? (
                        <p className="text-sm text-gray-400">No bookings</p>
                      ) : (
                        <div className="space-y-1">
                          {((viewData as { bookings: Array<{ id: string; room: { name: string }; startTime: string; machineType: string }> }).bookings ?? []).slice(0, 5).map((b) => (
                            <div key={b.id} className="text-xs text-gray-600 flex gap-2">
                              <span className="text-gray-400">{format(new Date(b.startTime), "d MMM HH:mm")}</span>
                              <span>{b.room.name}</span>
                              <span className="text-gray-400">{b.machineType === "WASHER" ? "Washer" : "Dryer"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "all" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Apartment</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-5 py-3 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3 text-gray-500">{u.apartment || "–"}</td>
                  <td className="px-5 py-3">
                    {changingRole === u.id ? (
                      <div className="flex items-center gap-1">
                        <select defaultValue={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                        {roleLoading && <Loader2 size={12} className="animate-spin text-blue-600" />}
                        <button onClick={() => setChangingRole(null)} className="p-1 text-gray-400 hover:text-gray-600"><span className="text-xs">✕</span></button>
                      </div>
                    ) : (
                      <button onClick={() => setChangingRole(u.id)} className="flex items-center gap-1 text-xs hover:bg-gray-100 px-2 py-1 rounded-lg">
                        {ROLE_ICON[u.role]}
                        <span>{ROLE_LABEL[u.role] ?? u.role}</span>
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{format(new Date(u.createdAt), "d MMM yyyy")}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => viewUser(u.id)} className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border transition-all ${viewing === u.id ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                        <Eye size={11} /> View
                      </button>
                      <button onClick={() => impersonateUser(u.id)} disabled={impersonating === u.id} title="Log in as this user" className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100 disabled:opacity-50">
                        {impersonating === u.id ? <Loader2 size={11} className="animate-spin" /> : <LogIn size={11} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
