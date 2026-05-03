import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get("token") !== "SEED_SECRET_2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existingCount = await prisma.user.count()
  if (existingCount > 1) {
    return NextResponse.json({ message: "Already seeded", users: existingCount })
  }

  const pw = await bcrypt.hash("Laundry123!", 10)

  const room = await prisma.room.create({
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

  const users = await Promise.all([
    prisma.user.create({ data: { name: "Jón Jónsson", email: "jon@laundry.is", password: pw, role: "USER", apartment: "1A" } }),
    prisma.user.create({ data: { name: "Anna Sigurðardóttir", email: "anna@laundry.is", password: pw, role: "USER", apartment: "2B" } }),
  ])

  const admins = await Promise.all([
    prisma.user.create({ data: { name: "Gunnar Björnsson", email: "gunnar@laundry.is", password: pw, role: "ADMIN", apartment: "3C" } }),
    prisma.user.create({ data: { name: "Sigríður Eiríksdóttir", email: "sigridur@laundry.is", password: pw, role: "ADMIN", apartment: "4D" } }),
    prisma.user.create({ data: { name: "Magnús Pétursson", email: "magnus@laundry.is", password: pw, role: "ADMIN", apartment: "5E" } }),
  ])

  const allUsers = [...users, ...admins]
  await Promise.all(allUsers.map((u) => prisma.userRoom.create({ data: { userId: u.id, roomId: room.id } })))

  return NextResponse.json({
    success: true,
    room: room.name,
    users: users.map((u) => ({ name: u.name, email: u.email, role: u.role })),
    admins: admins.map((u) => ({ name: u.name, email: u.email, role: u.role })),
    password: "Laundry123!",
  })
}
