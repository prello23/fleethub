"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { is } from "date-fns/locale"
import { Pencil, Trash2, Check, X, Loader2, Shield, User } from "lucide-react"

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  apartment: string | null
  createdAt: Date | string
}

export default function UserTable({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<UserRow>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  function startEdit(user: UserRow) {
    setEditing(user.id)
    setEditData({ name: user.name, role: user.role, apartment: user.apartment ?? "" })
  }

  async function saveEdit(userId: string) {
    setLoading(userId)
    await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    })
    setEditing(null)
    setLoading(null)
    router.refresh()
  }

  async function deleteUser(userId: string) {
    setLoading(userId)
    await fetch(`/api/users/${userId}`, { method: "DELETE" })
    setDeleting(null)
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Nafn</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Netfang</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Íbúð</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Hlutverk</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Skráður</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  {editing === user.id ? (
                    <input
                      value={editData.name}
                      onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{user.name}</span>
                      {user.id === currentUserId && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">þú</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500">{user.email}</td>
                <td className="px-5 py-3">
                  {editing === user.id ? (
                    <input
                      value={editData.apartment ?? ""}
                      onChange={(e) => setEditData((d) => ({ ...d, apartment: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="t.d. 3B"
                    />
                  ) : (
                    <span className="text-gray-600">{user.apartment || "–"}</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {editing === user.id ? (
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData((d) => ({ ...d, role: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USER">Notandi</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role === "ADMIN" ? <Shield size={10} /> : <User size={10} />}
                      {user.role === "ADMIN" ? "Admin" : "Notandi"}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {format(new Date(user.createdAt), "d. MMM yyyy", { locale: is })}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {editing === user.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(user.id)}
                          disabled={loading === user.id}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          {loading === user.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : deleting === user.id ? (
                      <>
                        <span className="text-xs text-red-600 mr-1">Eyða?</span>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={loading === user.id}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg"
                        >
                          {loading === user.id ? <Loader2 size={10} className="animate-spin" /> : "Já"}
                        </button>
                        <button
                          onClick={() => setDeleting(null)}
                          className="text-xs px-2 py-1 rounded-lg border border-gray-200"
                        >
                          Nei
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(user)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil size={14} />
                        </button>
                        {user.id !== currentUserId && (
                          <button
                            onClick={() => setDeleting(user.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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
