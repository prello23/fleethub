import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"
import ProfileForm from "@/components/ProfileForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Profile | Laundry" }

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, apartment: true },
  })
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
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Manage your account settings</p>
        </div>
      </div>

      <ProfileForm user={user} />
    </div>
  )
}
