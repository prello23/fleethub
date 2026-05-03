import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"

const url = process.env.DATABASE_URL ?? "file:./dev.db"
const dbPath = url.startsWith("file:") ? url.slice(5) : url

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaBetterSqlite3({ url: dbPath } as any)
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  console.log("🌱 Seeding database...")

  const password = await bcrypt.hash("Laundry123!", 10)

  // Create laundry house
  const laundryHouse = await prisma.laundryHouse.upsert({
    where: { id: "house-1" },
    update: {},
    create: {
      id: "house-1",
      name: "Þvottahús 1",
      address: "Húsagata 1",
    },
  })

  // Seed users
  const users = [
    { email: "user1@laundry.is", name: "User One" },
    { email: "user2@laundry.is", name: "User Two" },
  ]
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        password,
        role: "USER",
        laundryHouseId: laundryHouse.id,
      },
    })
  }

  // Seed admins
  const admins = [
    { email: "admin1@laundry.is", name: "Admin One" },
    { email: "admin2@laundry.is", name: "Admin Two" },
    { email: "admin3@laundry.is", name: "Admin Three" },
  ]
  for (const a of admins) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: {
        email: a.email,
        name: a.name,
        password,
        role: "ADMIN",
        laundryHouseId: laundryHouse.id,
      },
    })
  }

  // Super admin
  await prisma.user.upsert({
    where: { email: "elvarpa@gmail.com" },
    update: {},
    create: {
      email: "elvarpa@gmail.com",
      name: "Elvar Páll Sævarsson",
      password: await bcrypt.hash("Valdisgunnar2312", 10),
      role: "SUPER_ADMIN",
      laundryHouseId: laundryHouse.id,
    },
  })

  console.log("✅ Seed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
