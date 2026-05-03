"use client"

import { useState } from "react"
import { Loader2, Bell, BellOff, Mail } from "lucide-react"

type Props = {
  user: { name: string; email: string; apartment: string | null; notifyPush: boolean; notifyEmail: boolean }
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

  const [notifyPush, setNotifyPush] = useState(user.notifyPush)
  const [notifyEmail, setNotifyEmail] = useState(user.notifyEmail)
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notifySuccess, setNotifySuccess] = useState(false)

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

  async function handleNotifications(e: React.FormEvent) {
    e.preventDefault()
    setNotifyLoading(true)
    setNotifySuccess(false)
    await fetch("/api/user/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifyPush, notifyEmail }),
    })
    setNotifySuccess(true)
    setNotifyLoading(false)
    setTimeout(() => setNotifySuccess(false), 3000)
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

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Tilkynningar</h2>
        <form onSubmit={handleNotifications} className="space-y-4">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${notifyPush ? "bg-blue-100" : "bg-gray-100"}`}>
                {notifyPush ? <Bell size={16} className="text-blue-700" /> : <BellOff size={16} className="text-gray-400" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Push tilkynningar</p>
                <p className="text-xs text-gray-500">Vafragluggi / símatilkynningar</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyPush}
              onClick={() => setNotifyPush(!notifyPush)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyPush ? "bg-blue-700" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyPush ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </label>

          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${notifyEmail ? "bg-blue-100" : "bg-gray-100"}`}>
                <Mail size={16} className={notifyEmail ? "text-blue-700" : "text-gray-400"} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Tölvupóststilkynningar</p>
                <p className="text-xs text-gray-500">Bókunarstaðfestingar og minnisatriði</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyEmail}
              onClick={() => setNotifyEmail(!notifyEmail)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyEmail ? "bg-blue-700" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyEmail ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </label>

          {notifySuccess && <p className="text-green-600 text-sm">Stillingar vistaðar!</p>}
          <button
            type="submit"
            disabled={notifyLoading}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-60 flex items-center gap-2"
          >
            {notifyLoading && <Loader2 size={14} className="animate-spin" />}
            Vista stillingar
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
