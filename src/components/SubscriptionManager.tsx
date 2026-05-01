"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { is } from "date-fns/locale"
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react"

type Plan = { id: string; name: string; price: number; currency: string }
type Sub = {
  id: string
  userId: string
  status: string
  startDate: string | Date
  endDate: string | Date | null
  notes: string | null
  user: { id: string; name: string; email: string }
  plan: Plan
}
type AdminSub = {
  id: string; userId: string; status: string
  startDate: string | Date; endDate: string | Date | null; notes: string | null
  plan: Plan
}
type Admin = {
  id: string; name: string; email: string
  subscription: AdminSub | null
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Virk", TRIAL: "Prufa", CANCELLED: "Hætt við", EXPIRED: "Útrunnin",
}
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  TRIAL: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
}

export default function SubscriptionManager({ subscriptions, plans, admins }: {
  subscriptions: Sub[]
  plans: Plan[]
  admins: Admin[]
}) {
  const router = useRouter()
  const [subs, setSubs] = useState(subscriptions)
  const [editing, setEditing] = useState<Sub | null>(null)
  const [creating, setCreating] = useState(false)
  const [newForm, setNewForm] = useState({ userId: "", planId: plans[0]?.id ?? "", status: "ACTIVE", endDate: "", notes: "" })
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const adminsWithoutSub = admins.filter((a) => !subs.find((s) => s.userId === a.id))

  async function saveSub() {
    setLoading(true)
    if (editing) {
      const res = await fetch(`/api/subscriptions/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: editing.plan.id, status: editing.status, endDate: editing.endDate || null, notes: editing.notes }),
      })
      const updated = await res.json()
      setSubs((s) => s.map((x) => (x.id === editing.id ? updated : x)))
      setEditing(null)
    } else {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      })
      const created = await res.json()
      setSubs((s) => [...s, created])
      setCreating(false)
    }
    setLoading(false)
    router.refresh()
  }

  async function deleteSub(id: string) {
    setLoading(true)
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" })
    setSubs((s) => s.filter((x) => x.id !== id))
    setDeleting(null)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setCreating(true)}
          disabled={adminsWithoutSub.length === 0}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-800 disabled:opacity-50"
        >
          <Plus size={16} /> Bæta við áskrift
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-green-900">Ný áskrift</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin</label>
              <select value={newForm.userId} onChange={(e) => setNewForm((f) => ({ ...f, userId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Veldu admin...</option>
                {adminsWithoutSub.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Áætlun</label>
              <select value={newForm.planId} onChange={(e) => setNewForm((f) => ({ ...f, planId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.price.toLocaleString("is-IS")} {p.currency}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staða</label>
              <select value={newForm.status} onChange={(e) => setNewForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokadagur (valkvætt)</label>
              <input type="date" value={newForm.endDate} onChange={(e) => setNewForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Athugasemdir</label>
              <input value={newForm.notes} onChange={(e) => setNewForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="t.d. greiddi í reiðufé..." />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCreating(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50"><X size={14} className="inline mr-1" />Hætta við</button>
            <button onClick={saveSub} disabled={loading || !newForm.userId} className="flex items-center gap-2 bg-green-700 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-800 disabled:opacity-60">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}Vista
            </button>
          </div>
        </div>
      )}

      {/* Subscriptions list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Admin</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Áætlun</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Staða</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Lokadagur</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Engar áskriftir skráðar</td></tr>
            )}
            {subs.map((sub) => (
              <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{sub.user.name}</p>
                  <p className="text-xs text-gray-400">{sub.user.email}</p>
                </td>
                <td className="px-5 py-3">
                  {editing?.id === sub.id ? (
                    <select value={editing.plan.id}
                      onChange={(e) => setEditing((s) => s ? { ...s, plan: plans.find((p) => p.id === e.target.value) ?? s.plan } : s)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  ) : (
                    <span className="text-gray-700">{sub.plan.name}</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {editing?.id === sub.id ? (
                    <select value={editing.status}
                      onChange={(e) => setEditing((s) => s ? { ...s, status: e.target.value } : s)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[sub.status] ?? "bg-gray-100"}`}>
                      {STATUS_LABELS[sub.status] ?? sub.status}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {editing?.id === sub.id ? (
                    <input type="date" value={editing.endDate ? format(new Date(editing.endDate as string), "yyyy-MM-dd") : ""}
                      onChange={(e) => setEditing((s) => s ? { ...s, endDate: e.target.value } : s)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <span className="text-gray-500 text-xs">
                      {sub.endDate ? format(new Date(sub.endDate as string), "d. MMM yyyy", { locale: is }) : "Engin lok"}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {editing?.id === sub.id ? (
                      <>
                        <button onClick={saveSub} disabled={loading} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button onClick={() => setEditing(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={14} /></button>
                      </>
                    ) : deleting === sub.id ? (
                      <>
                        <span className="text-xs text-red-600 mr-1">Eyða?</span>
                        <button onClick={() => deleteSub(sub.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg">{loading ? <Loader2 size={10} className="animate-spin" /> : "Já"}</button>
                        <button onClick={() => setDeleting(null)} className="text-xs px-2 py-1 border rounded-lg">Nei</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditing(sub)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button>
                        <button onClick={() => setDeleting(sub.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
