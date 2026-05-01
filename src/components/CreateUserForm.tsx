"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, Loader2, X, Eye, EyeOff } from "lucide-react"

type Room = { id: string; name: string }

export default function CreateUserForm({ rooms }: { rooms: Room[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ password?: string; emailSent?: boolean } | null>(null)
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", apartment: "", roomId: rooms[0]?.id ?? "" })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error === "Email already registered" ? "Email already registered" : (data.error || "Something went wrong"))
      setLoading(false)
      return
    }

    // Auto-send password email
    if (data.id) {
      const pwRes = await fetch(`/api/users/${data.id}/send-password`, { method: "POST" })
      const pwData = await pwRes.json()
      if (!pwData.emailSent && pwData.password) {
        setResult({ emailSent: false, password: pwData.password })
      } else {
        setResult({ emailSent: true })
      }
    }

    setLoading(false)
    setForm({ name: "", email: "", password: "", apartment: "", roomId: rooms[0]?.id ?? "" })
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 mb-6"
      >
        <UserPlus size={16} />
        Create user
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Create new user</h3>
        <button onClick={() => { setOpen(false); setError(""); setResult(null) }} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
          <X size={18} />
        </button>
      </div>

      {result && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm border ${result.emailSent ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
          {result.emailSent
            ? "User created and password sent via email."
            : (
              <>
                User created. Email not configured — share this password manually:
                <span className="block mt-1 font-mono font-bold text-base">{result.password}</span>
              </>
            )}
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Full name</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            placeholder="Jane Smith"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            placeholder="jane@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Apartment</label>
          <input
            value={form.apartment}
            onChange={(e) => set("apartment", e.target.value)}
            placeholder="e.g. 3B"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Temporary password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
              minLength={6}
              placeholder="min. 6 characters"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-2.5 text-gray-400">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        {rooms.length > 0 && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Assign to room</label>
            <select
              value={form.roomId}
              onChange={(e) => set("roomId", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— no room assignment —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="sm:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Create &amp; send password
          </button>
          <button type="button" onClick={() => { setOpen(false); setError(""); setResult(null) }} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
