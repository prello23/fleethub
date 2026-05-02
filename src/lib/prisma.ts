import { PrismaClient } from "../generated/prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db"
  console.log("[Prisma] init. node:", process.version, "url:", url)
  try {
    const libsql = createClient({ url })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter } as never)
  } catch (err) {
    console.error("[Prisma] FAILED:", err)
    throw err
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
