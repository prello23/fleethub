import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"

const url = process.env.DATABASE_URL ?? "file:./dev.db"
const adapter = new PrismaBetterSqlite3({ url })
const prisma = new PrismaClient({ adapter } as never)

async function main() {
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
  } else {
    console.log("Admin already exists")
  }

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
