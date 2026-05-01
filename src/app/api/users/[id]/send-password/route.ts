import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendEmail, isEmailConfigured } from "@/lib/email"

function randomPassword(len = 12): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const newPassword = randomPassword()
  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id }, data: { password: hashed } })

  if (isEmailConfigured()) {
    await sendEmail({
      to: user.email,
      subject: "Your laundry room login details",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h2 style="color:#2563eb">🧺 Laundry Booking – Account details</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your account has been set up. Use the credentials below to sign in:</p>
          <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:0"><strong>Email:</strong> ${user.email}</p>
            <p style="margin:8px 0 0"><strong>Password:</strong> ${newPassword}</p>
          </div>
          <p>Please change your password after signing in.</p>
        </div>
      `,
    })
    return NextResponse.json({ ok: true, emailSent: true })
  }

  // Email not configured — return the plain password so admin can share manually
  return NextResponse.json({ ok: true, emailSent: false, password: newPassword })
}
