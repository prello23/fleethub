"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Check, X, Loader2, ToggleLeft, ToggleRight } from "lucide-react"

type Plan = {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  intervalDays: number
  maxRooms: number
  active: boolean
}

const empty: Omit<Plan, "id"> = {
  name: "",
  description: "",
  price: 2990,
  currency: "ISK",
  intervalDays: 30,
  maxRooms: 1,
  active: true,
}

export default function PlanManager({ initialPlans }: { initialPlans: Plan[] }) {
  const router = useRouter()
  const [plans, setPlans] = useState(initialPlans)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Omit<Plan, "id">>(empty)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  function startEdit(plan: Plan) {
    setEditing(plan.id)
    setCreating(false)
    setForm({ name: plan.name, description: plan.description ?? "", price: plan.price, currency: plan.currency, intervalDays: plan.intervalDays, maxRooms: plan.maxRooms, active: plan.active })
  }

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function save() {
    setLoading(true)
    if (editing) {
      const res = await fetch(`/api/plans/${editing}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const updated = await res.json()
      setPlans((p) => p.map((x) => (x.id === editing ? updated : x)))
      setEditing(null)
    } else {
      const res = await fetch("/api/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const created = await res.json()
      setPlans((p) => [...p, created])
      setCreating(false)
      setForm(empty)
    }
    setLoading(false)
    router.refresh()
  }

  async function deletePlan(id: string) {
    setLoading(true)
    await fetch(`/api/plans/${id}`, { method: "DELETE" })
    setPlans((p) => p.filter((x) => x.id !== id))
    setDeleting(null)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => { setCreating(true); setEditing(null); setForm(empty) }}
          className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-800"
        >
          <Plus size={16} /> Ný verðáætlun
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <PlanForm form={form} set={set} onSave={save} onCancel={() => setCreating(false)} loading={loading} title="Ný verðáætlun" />
      )}

      <div className="space-y-3">
        {plans.map((plan) => (
          <div key={plan.id}>
            {editing === plan.id ? (
              <PlanForm form={form} set={set} onSave={save} onCancel={() => setEditing(null)} loading={loading} title={`Breyta: ${plan.name}`} />
            ) : (
              <div className={`bg-white rounded-2xl border p-5 flex items-center gap-4 ${plan.active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    {!plan.active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Óvirkt</span>}
                  </div>
                  {plan.description && <p className="text-xs text-gray-500 mb-1">{plan.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>Allt að {plan.maxRooms === 999 ? "∞" : plan.maxRooms} þvottahús</span>
                    <span>{plan.intervalDays} daga tímabil</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{plan.price.toLocaleString("is-IS")}</p>
                  <p className="text-xs text-gray-400">{plan.currency} / {plan.intervalDays} dagar</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(plan)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Pencil size={14} />
                  </button>
                  {deleting === plan.id ? (
                    <>
                      <button onClick={() => deletePlan(plan.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg">
                        {loading ? <Loader2 size={10} className="animate-spin" /> : "Já"}
                      </button>
                      <button onClick={() => setDeleting(null)} className="text-xs px-2 py-1 border rounded-lg">Nei</button>
                    </>
                  ) : (
                    <button onClick={() => setDeleting(plan.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PlanForm({ form, set, onSave, onCancel, loading, title }: {
  form: Omit<Plan, "id">
  set: <K extends keyof Omit<Plan, "id">>(key: K, value: Omit<Plan, "id">[K]) => void
  onSave: () => void
  onCancel: () => void
  loading: boolean
  title: string
}) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-purple-900">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Heiti áætlunar</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="t.d. Grunnáskrift" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lýsing</label>
          <input value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Stuttlýsing..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Verð</label>
          <div className="flex gap-2">
            <input type="number" min={0} value={form.price} onChange={(e) => set("price", parseFloat(e.target.value))} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>ISK</option><option>EUR</option><option>USD</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tímabil (dagar)</label>
          <input type="number" min={1} value={form.intervalDays} onChange={(e) => set("intervalDays", parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hámarks þvottahús</label>
          <input type="number" min={1} value={form.maxRooms === 999 ? "" : form.maxRooms} onChange={(e) => set("maxRooms", e.target.value === "" ? 999 : parseInt(e.target.value))} placeholder="999 = ótakmarkað" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div className="flex items-center gap-3 pt-5">
          <button type="button" onClick={() => set("active", !form.active)} className={`flex items-center gap-2 text-sm font-medium ${form.active ? "text-green-700" : "text-gray-500"}`}>
            {form.active ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} />}
            {form.active ? "Virkt" : "Óvirkt"}
          </button>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50"><X size={14} className="inline mr-1" />Hætta við</button>
        <button onClick={onSave} disabled={loading} className="flex items-center gap-2 bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-purple-800 disabled:opacity-60">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Vista
        </button>
      </div>
    </div>
  )
}
