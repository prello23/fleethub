import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { encode } from "next-auth/jwt"

// GET ?userId=XXX — sets JWT cookie → redirects to /rooms as that user
export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, apartment: true },
  })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const secret = process.env.AUTH_SECRET
  if (!secret) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

  const isProd = process.env.NODE_ENV === "production"
  const cookieName = isProd ? "__Secure-authjs.session-token" : "authjs.session-token"

  const maxAge = 60 * 60 * 8
  const token = await encode({
    token: {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      apartment: user.apartment,
      impersonatedBy: session.user.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + maxAge,
    },
    secret,
    salt: cookieName,
    maxAge,
  })

  const response = NextResponse.redirect(new URL("/rooms", req.url))
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge,
  })
  return response
}

// POST — returns user data for the preview panel in AdminOverview
export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId } = await req.json()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, role: true, apartment: true, createdAt: true,
      bookings: { include: { room: true }, orderBy: { startTime: "desc" }, take: 20 },
    },
  })

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(user)
}
