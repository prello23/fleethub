import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get("token") !== "SEED_SECRET_2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results: string[] = []

  // Super admin — always upsert so password is always correct on every call
  const superAdminPw = await bcrypt.hash("Valdisgunnar2312", 12)
  await prisma.user.upsert({
    where: { email: "elvarpa@gmail.com" },
    update: { password: superAdminPw, name: "Elvar Páll Sævarsson", role: "SUPER_ADMIN" },
    create: {
      name: "Elvar Páll Sævarsson",
      email: "elvarpa@gmail.com",
      password: superAdminPw,
      role: "SUPER_ADMIN",
    },
  })
  results.push("superadmin: elvarpa@gmail.com (upserted)")

  // Demo room
  const existingRoom = await prisma.room.findFirst({ where: { name: "Þvottahús 1" } })
  let room = existingRoom
  if (!room) {
    room = await prisma.room.create({
      data: {
        name: "Þvottahús 1",
        description: "Aðalþvottahús hússins",
        address: "Reykjavík",
        washingMachines: 2,
        dryers: 1,
        slotDurationMinutes: 60,
        pricePerSlot: 0,
      },
    })
    results.push("room: Þvottahús 1 (created)")
  } else {
    results.push("room: Þvottahús 1 (already exists)")
  }

  // Demo users — skip if email already registered
  const demoPassword = await bcrypt.hash("Laundry123!", 10)
  const demoUsers = [
    { name: "Jón Jónsson", email: "jon@laundry.is", role: "USER", apartment: "1A" },
    { name: "Anna Sigurðardóttir", email: "anna@laundry.is", role: "USER", apartment: "2B" },
    { name: "Gunnar Björnsson", email: "gunnar@laundry.is", role: "ADMIN", apartment: "3C" },
    { name: "Sigríður Eiríksdóttir", email: "sigridur@laundry.is", role: "ADMIN", apartment: "4D" },
    { name: "Magnús Pétursson", email: "magnus@laundry.is", role: "ADMIN", apartment: "5E" },
  ]

  for (const u of demoUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    if (!existing) {
      const created = await prisma.user.create({
        data: { name: u.name, email: u.email, password: demoPassword, role: u.role, apartment: u.apartment },
      })
      await prisma.userRoom.upsert({
        where: { userId_roomId: { userId: created.id, roomId: room!.id } },
        update: {},
        create: { userId: created.id, roomId: room!.id },
      })
      results.push(`user: ${u.email} (created)`)
    } else {
      results.push(`user: ${u.email} (already exists)`)
    }
  }

  return NextResponse.json({ success: true, results, demoPassword: "Laundry123!" })
}
