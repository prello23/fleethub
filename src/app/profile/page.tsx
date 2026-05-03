import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getServerT } from "@/lib/server-i18n"
import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"
import ProfileForm from "@/components/ProfileForm"
import CheckForUpdates from "@/components/CheckForUpdates"
import type { Metadata } from "next"

const APP_VERSION = process.env.APP_VERSION ?? "1.0.0"

export const metadata: Metadata = { title: "Profile | Laundry" }

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { t } = await getServerT()

  const user = db.prepare(
    `SELECT name, email, apartment, notifyPush, notifyEmail FROM "User" WHERE id = ?`
  ).get(session.user.id) as {
    name: string; email: string; apartment: string | null
    notifyPush: number; notifyEmail: number
  } | undefined

  if (!user) redirect("/login")

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/rooms" className="p-2 rounded-lg hover:bg-gray-200 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <User size={20} className="text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t("nav.profile")}</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">{t("profile.subtitle")}</p>
        </div>
      </div>

      <ProfileForm user={{ ...user, notifyPush: !!user.notifyPush, notifyEmail: !!user.notifyEmail }} />
      <div className="mt-6">
        <CheckForUpdates currentVersion={APP_VERSION} />
      </div>
    </div>
  )
}
