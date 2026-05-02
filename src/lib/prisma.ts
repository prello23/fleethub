import { PrismaClient } from "../generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db"
  console.log("[Prisma] init. node:", process.version, "url:", url)
  try {
    const adapter = new PrismaLibSql({ url })
    return new PrismaClient({ adapter } as never)
  } catch (err) {
    console.error("[Prisma] FAILED:", err)
    throw err
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
