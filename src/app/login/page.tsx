"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { WashingMachine, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError("Rangt netfang eða lykilorð")
      setLoading(false)
    } else {
      router.push("/rooms")
      router.refresh()
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <WashingMachine className="text-blue-700" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Innskráning</h1>
          <p className="text-gray-500 text-sm mt-1">Skráðu þig inn á þvottahús bókunarkerfi</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Netfang</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="netfang@dæmi.is"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lykilorð</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2.5 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Skrá inn
          </button>

          <p className="text-center text-sm text-gray-500">
            Ertu ekki með aðgang?{" "}
            <Link href="/register" className="text-blue-700 font-medium hover:underline">
              Nýskrá sig
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
