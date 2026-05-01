"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

type Props = {
  user: { name: string; email: string; apartment: string | null }
}

export default function ProfileForm({ user }: Props) {
  const [apartment, setApartment] = useState(user.apartment ?? "")
  const [aptLoading, setAptLoading] = useState(false)
  const [aptSuccess, setAptSuccess] = useState(false)

  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)

  async function handleApartment(e: React.FormEvent) {
    e.preventDefault()
    setAptLoading(true)
    setAptSuccess(false)
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apartment: apartment || null }),
    })
    setAptSuccess(true)
    setAptLoading(false)
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwLoading(true)
    setPwError("")
    setPwSuccess(false)
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    if (res.ok) {
      setPwSuccess(true)
      setCurrentPw("")
      setNewPw("")
    } else {
      const data = await res.json().catch(() => ({}))
      setPwError(data.error === "Wrong password" ? "Incorrect current password" : "Failed to change password")
    }
    setPwLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Account info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-900">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Apartment */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Apartment</h2>
        <form onSubmit={handleApartment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apartment number</label>
            <input
              type="text"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              placeholder="e.g. 3A"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {aptSuccess && <p className="text-green-600 text-sm">Apartment updated!</p>}
          <button
            type="submit"
            disabled={aptLoading}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-60 flex items-center gap-2"
          >
            {aptLoading && <Loader2 size={14} className="animate-spin" />}
            Save
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Change password</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="At least 6 characters"
            />
          </div>
          {pwError && <p className="text-red-600 text-sm">{pwError}</p>}
          {pwSuccess && <p className="text-green-600 text-sm">Password changed!</p>}
          <button
            type="submit"
            disabled={pwLoading}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-60 flex items-center gap-2"
          >
            {pwLoading && <Loader2 size={14} className="animate-spin" />}
            Change password
          </button>
        </form>
      </div>
    </div>
  )
}
