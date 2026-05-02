import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"

const url = process.env.DATABASE_URL ?? "file:./dev.db"
const adapter = new PrismaLibSql({ url })
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  // Super Admin
  const superAdminExists = await prisma.user.findUnique({ where: { email: "elvarpa@gmail.com" } })
  if (!superAdminExists) {
    await prisma.user.create({
      data: {
        name: "Elvar",
        email: "elvarpa@gmail.com",
        password: await bcrypt.hash("Valdisgunnar2312", 12),
        role: "SUPER_ADMIN",
      },
    })
    console.log("✓ Super Admin created: elvarpa@gmail.com")
  }

  // Admin
  const adminExists = await prisma.user.findUnique({ where: { email: "admin@laundry.local" } })
  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@laundry.local",
        password: await bcrypt.hash("admin1234", 12),
        role: "ADMIN",
      },
    })
    console.log("✓ Admin created: admin@laundry.local / admin1234")
  }

  // Default plans
  const planCount = await prisma.plan.count()
  if (planCount === 0) {
    await prisma.plan.createMany({
      data: [
        {
          name: "Grunnáskrift",
          description: "1 þvottahús, allar grunneiginleikar",
          price: 2990,
          currency: "ISK",
          intervalDays: 30,
          maxRooms: 1,
        },
        {
          name: "Meðaláskrift",
          description: "Allt að 3 þvottahús",
          price: 5990,
          currency: "ISK",
          intervalDays: 30,
          maxRooms: 3,
        },
        {
          name: "Stórfyrirtæki",
          description: "Ótakmarkaður fjöldi þvottahúsa",
          price: 12990,
          currency: "ISK",
          intervalDays: 30,
          maxRooms: 999,
        },
      ],
    })
    console.log("✓ Created 3 default plans")
  }

  // Example rooms
  const roomCount = await prisma.room.count()
  if (roomCount === 0) {
    await prisma.room.createMany({
      data: [
        {
          name: "Þvottahús A-hluta",
          description: "Staðsett í kjallara við inngang A",
          washingMachines: 3,
          dryers: 2,
          slotDurationMinutes: 60,
          notifyMinutesBefore: 30,
          notifyMinutesBeforeEnd: 10,
        },
        {
          name: "Þvottahús B-hluta",
          description: "Staðsett á jarðhæð við inngang B",
          washingMachines: 2,
          dryers: 1,
          slotDurationMinutes: 90,
          notifyMinutesBefore: 20,
          notifyMinutesBeforeEnd: 10,
        },
      ],
    })
    console.log("✓ Created 2 example rooms")
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
